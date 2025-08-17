import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/**
 * Chat Router - Protected API for authenticated plumbers
 * Handles dashboard chat, voice invoice generation, and chat management
 */
export const chatRouter = createTRPCRouter({
  // Get chat sessions for organization
  getSessions: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      status: z.enum(["active", "inactive", "all"]).default("all"),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {};
      
      if (input.status === "active") {
        whereClause.isActive = true;
      } else if (input.status === "inactive") {
        whereClause.isActive = false;
      }

      const sessions = await ctx.db.chatSession.findMany({
        where: whereClause,
        orderBy: { lastActivity: "desc" },
        take: input.limit,
        skip: input.offset,
        include: {
          _count: {
            select: {
              // Count related chat logs through sessionId
            }
          }
        }
      });

      // Get chat logs count for each session manually (since Prisma doesn't support this directly)
      const sessionsWithCounts = await Promise.all(
        sessions.map(async (session) => {
          const chatLogsCount = await ctx.db.chatLog.count({
            where: { sessionId: session.sessionId }
          });
          
          return {
            ...session,
            chatLogsCount,
          };
        })
      );

      return sessionsWithCounts;
    }),

  // Get chat history for a specific session
  getChatHistory: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      organizationId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const chatLogs = await ctx.db.chatLog.findMany({
        where: {
          sessionId: input.sessionId,
          organizationId: input.organizationId,
        },
        orderBy: { messageNumber: "asc" },
      });

      const session = await ctx.db.chatSession.findUnique({
        where: { sessionId: input.sessionId },
      });

      return {
        session,
        messages: chatLogs,
      };
    }),

  // Voice invoice generation - convert speech to invoice
  processVoiceInvoice: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      plumberId: z.string(),
      voiceText: z.string(),
      language: z.enum(["nl", "en"]).default("nl"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Parse voice text for invoice details using Dutch plumbing terminology
      const invoiceData = await parseVoiceToInvoice(input.voiceText, input.language);
      
      if (!invoiceData.isValid) {
        return {
          success: false,
          error: invoiceData.error,
          suggestion: invoiceData.suggestion,
        };
      }

      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Calculate BTW (Dutch tax)
      const btwRate = 21; // Standard 21% for plumbing services
      const btwAmount = (invoiceData.subtotal * btwRate) / 100;
      const totalAmount = invoiceData.subtotal + btwAmount;

      // Create invoice record
      const invoice = await ctx.db.invoice.create({
        data: {
          organizationId: input.organizationId,
          plumberId: input.plumberId,
          customerId: invoiceData.customerId,
          invoiceNumber,
          subtotal: invoiceData.subtotal,
          btwRate: btwRate,
          btwAmount: btwAmount,
          totalAmount: totalAmount,
          status: "draft",
          notes: `Generated from voice: "${input.voiceText}"`,
        },
      });

      // If job ID was mentioned, link the invoice
      if (invoiceData.jobId) {
        await ctx.db.job.update({
          where: { id: invoiceData.jobId },
          data: {
            invoices: {
              connect: { id: invoice.id }
            }
          }
        });
      }

      return {
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          subtotal: invoiceData.subtotal,
          btwAmount: btwAmount,
          totalAmount: totalAmount,
          customerName: invoiceData.customerName,
        },
        parsedItems: invoiceData.items,
      };
    }),

  // Get recent bookings from widget
  getRecentBookings: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      status: z.enum(["new", "confirmed", "scheduled", "completed", "cancelled", "all"]).default("new"),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        organizationId: input.organizationId,
      };

      if (input.status !== "all") {
        whereClause.status = input.status;
      }

      const bookings = await ctx.db.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return bookings;
    }),

  // Convert booking to job
  convertBookingToJob: protectedProcedure
    .input(z.object({
      bookingId: z.string(),
      organizationId: z.string(),
      plumberId: z.string(),
      scheduledAt: z.date(),
      estimatedDuration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
      });

      if (!booking || booking.organizationId !== input.organizationId) {
        throw new Error("Booking not found");
      }

      // Create or find customer
      let customer = await ctx.db.customer.findFirst({
        where: {
          organizationId: input.organizationId,
          phone: booking.customerPhone,
        },
      });

      if (!customer) {
        customer = await ctx.db.customer.create({
          data: {
            organizationId: input.organizationId,
            name: booking.customerName,
            email: booking.customerEmail,
            phone: booking.customerPhone,
            streetAddress: booking.address,
            postalCode: booking.postalCode,
            city: booking.city,
          },
        });
      }

      // Create job
      const job = await ctx.db.job.create({
        data: {
          organizationId: input.organizationId,
          plumberId: input.plumberId,
          customerId: customer.id,
          title: `${booking.serviceType} - ${booking.customerName}`,
          description: booking.description,
          jobType: booking.urgency === "emergency" ? "emergency" : "repair",
          priority: booking.urgency === "emergency" ? "emergency" : "normal",
          status: "scheduled",
          scheduledAt: input.scheduledAt,
          duration: input.estimatedDuration,
          address: booking.address,
          postalCode: booking.postalCode,
          city: booking.city,
        },
      });

      // Update booking status and link to job
      await ctx.db.booking.update({
        where: { id: input.bookingId },
        data: {
          status: "scheduled",
          jobId: job.id,
          assignedPlumberId: input.plumberId,
        },
      });

      return {
        job,
        customer,
        message: "Booking successfully converted to scheduled job",
      };
    }),

  // Get feedback for organization
  getFeedback: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      status: z.enum(["new", "reviewed", "resolved", "all"]).default("new"),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        organizationId: input.organizationId,
      };

      if (input.status !== "all") {
        whereClause.status = input.status;
      }

      const feedback = await ctx.db.feedback.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return feedback;
    }),

  // Update feedback status
  updateFeedbackStatus: protectedProcedure
    .input(z.object({
      feedbackId: z.string(),
      organizationId: z.string(),
      status: z.enum(["new", "reviewed", "resolved"]),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const feedback = await ctx.db.feedback.update({
        where: {
          id: input.feedbackId,
          organizationId: input.organizationId,
        },
        data: {
          status: input.status,
          adminNotes: input.adminNotes,
          updatedAt: new Date(),
        },
      });

      return feedback;
    }),
});

/**
 * Voice Invoice Parser
 * Converts Dutch/English voice input to structured invoice data
 */
async function parseVoiceToInvoice(voiceText: string, language: "nl" | "en"): Promise<{
  isValid: boolean;
  error?: string;
  suggestion?: string;
  subtotal: number;
  customerId?: string;
  customerName?: string;
  jobId?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}> {
  const text = voiceText.toLowerCase();
  
  // Dutch plumbing terminology mapping
  const dutchTerms = {
    'één uur': 1, 'twee uur': 2, 'drie uur': 3, 'vier uur': 4, 'vijf uur': 5,
    'nieuwe kraan': 'new tap', 'leiding reparatie': 'pipe repair',
    'afvoer maken': 'drain cleaning', 'ketel onderhoud': 'boiler maintenance',
    'euro': '€', 'klaar': 'completed', 'gereed': 'completed'
  };

  // Extract labor hours
  const hourPatterns = language === "nl" 
    ? [/(\d+\.?\d*)\s*uur/g, /(één|twee|drie|vier|vijf)\s*uur/g]
    : [/(\d+\.?\d*)\s*hour/g];
  
  let totalHours = 0;
  for (const pattern of hourPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        if (isNaN(Number(match[1]))) {
          // Dutch number words
          const hourMap: { [key: string]: number } = { 'één': 1, 'twee': 2, 'drie': 3, 'vier': 4, 'vijf': 5 };
          totalHours += hourMap[match[1]] || 0;
        } else {
          totalHours += parseFloat(match[1]);
        }
      }
    }
  }

  // Extract costs and materials
  const costPattern = /€?\s*(\d+(?:[,.]?\d{2})?)/g;
  const costs: number[] = [];
  const costMatches = text.matchAll(costPattern);
  
  for (const match of costMatches) {
    const cost = parseFloat(match[1].replace(',', '.'));
    if (cost > 0) costs.push(cost);
  }

  // Extract customer name
  const customerPattern = language === "nl" 
    ? /(?:voor|klant|meneer|mevrouw)\s+([a-zA-Z\s]+)/i
    : /(?:for|customer|mr|mrs|ms)\s+([a-zA-Z\s]+)/i;
  
  const customerMatch = text.match(customerPattern);
  const customerName = customerMatch?.[1]?.trim();

  // Build invoice items
  const items: Array<{ description: string; quantity: number; unitPrice: number; total: number; }> = [];
  let subtotal = 0;

  // Add labor if hours detected
  if (totalHours > 0) {
    const hourlyRate = 75; // Default rate
    const laborCost = totalHours * hourlyRate;
    items.push({
      description: language === "nl" ? `Arbeidsuren (${totalHours}h)` : `Labor hours (${totalHours}h)`,
      quantity: totalHours,
      unitPrice: hourlyRate,
      total: laborCost,
    });
    subtotal += laborCost;
  }

  // Add materials from detected costs
  costs.forEach((cost, index) => {
    items.push({
      description: language === "nl" ? `Materiaal ${index + 1}` : `Material ${index + 1}`,
      quantity: 1,
      unitPrice: cost,
      total: cost,
    });
    subtotal += cost;
  });

  // Validation
  if (items.length === 0) {
    return {
      isValid: false,
      error: language === "nl" 
        ? "Geen uren of kosten gevonden in de spraak"
        : "No hours or costs found in speech",
      suggestion: language === "nl"
        ? "Probeer: 'Twee uur werk en materiaal voor 50 euro voor meneer de Vries'"
        : "Try: 'Two hours work and 50 euros materials for Mr. Smith'",
      subtotal: 0,
      items: [],
    };
  }

  return {
    isValid: true,
    subtotal,
    customerName,
    items,
  };
}