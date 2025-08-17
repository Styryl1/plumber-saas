import { z } from "zod";
import { createTRPCRouter, orgProtectedProcedure } from "~/server/api/trpc";

// Zod schemas for input validation
const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  jobIds: z.array(z.string()).min(1, "At least one job is required"),
  invoiceDate: z.date().default(() => new Date()),
  dueDate: z.date().optional(),
  btwRate: z.number().min(0).max(100).default(21), // Dutch BTW rates: 21% or 9%
  paymentMethod: z.enum(["ideal", "bank_transfer", "cash", "card"]).optional(),
  notes: z.string().optional(),
  // Manual line items (for custom charges)
  customLineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive().default(1),
    unitPrice: z.number().positive(),
    btwRate: z.number().min(0).max(100).default(21),
  })).default([]),
});

const updateInvoiceSchema = z.object({
  id: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  dueDate: z.date().optional(),
  paymentMethod: z.enum(["ideal", "bank_transfer", "cash", "card"]).optional(),
  paymentDate: z.date().optional(),
  notes: z.string().optional(),
});

const invoiceFiltersSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  customerId: z.string().optional(),
  plumberId: z.string().optional(),
  paymentMethod: z.enum(["ideal", "bank_transfer", "cash", "card"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  amountFrom: z.number().positive().optional(),
  amountTo: z.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["invoiceNumber", "invoiceDate", "dueDate", "totalAmount", "customer"]).default("invoiceDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Helper function to calculate BTW amounts
const calculateBTW = (subtotal: number, btwRate: number) => {
  const btwAmount = (subtotal * btwRate) / 100;
  const totalAmount = subtotal + btwAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    btwAmount: Math.round(btwAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

// Helper function to generate invoice number
const generateInvoiceNumber = async (db: any, organizationId: string, year: number) => {
  const yearPrefix = year.toString();
  
  // Find the latest invoice number for this year
  const latestInvoice = await db.invoice.findFirst({
    where: {
      organizationId,
      invoiceNumber: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  let nextNumber = 1;
  if (latestInvoice) {
    const lastNumber = parseInt(latestInvoice.invoiceNumber.slice(-4));
    nextNumber = lastNumber + 1;
  }

  return `${yearPrefix}${nextNumber.toString().padStart(4, "0")}`;
};

export const invoicesRouter = createTRPCRouter({
  /**
   * Get invoices with filtering, search, and pagination
   */
  list: orgProtectedProcedure
    .input(invoiceFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { db, orgId, userId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Get the current user's plumber record
      const currentPlumber = await db.plumber.findUnique({
        where: { clerkUserId: userId },
      });

      // Build where clause
      const where: any = {
        organizationId: organization.id,
      };

      // Apply filters
      if (input.status) where.status = input.status;
      if (input.customerId) where.customerId = input.customerId;
      if (input.paymentMethod) where.paymentMethod = input.paymentMethod;
      
      // Filter by plumber (if specified or if current user is not admin)
      if (input.plumberId) {
        where.plumberId = input.plumberId;
      } else if (currentPlumber) {
        // If current user is a plumber, only show their invoices
        where.plumberId = currentPlumber.id;
      }

      // Date range filters
      if (input.dateFrom || input.dateTo) {
        where.invoiceDate = {};
        if (input.dateFrom) where.invoiceDate.gte = input.dateFrom;
        if (input.dateTo) where.invoiceDate.lte = input.dateTo;
      }

      // Amount range filters
      if (input.amountFrom || input.amountTo) {
        where.totalAmount = {};
        if (input.amountFrom) where.totalAmount.gte = input.amountFrom;
        if (input.amountTo) where.totalAmount.lte = input.amountTo;
      }

      // Search filter
      if (input.search) {
        where.OR = [
          { invoiceNumber: { contains: input.search, mode: "insensitive" } },
          { notes: { contains: input.search, mode: "insensitive" } },
          { customer: { name: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      // Handle overdue status (not a database field)
      if (input.status === "overdue") {
        where.status = "sent";
        where.dueDate = { lt: new Date() };
      }

      // Get total count for pagination
      const total = await db.invoice.count({ where });

      // Determine sort order
      const orderBy: any = {};
      if (input.sortBy === "customer") {
        orderBy.customer = { name: input.sortOrder };
      } else {
        orderBy[input.sortBy] = input.sortOrder;
      }

      // Get invoices with pagination
      const invoices = await db.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              customerType: true,
            },
          },
          plumber: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              jobType: true,
              status: true,
              completedAt: true,
            },
          },
        },
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      return {
        invoices: invoices.map((invoice) => {
          // Determine actual status (including overdue)
          const actualStatus = invoice.status === "sent" && invoice.dueDate && invoice.dueDate < new Date()
            ? "overdue"
            : invoice.status;

          // Calculate days overdue or until due
          let daysDiff = 0;
          if (invoice.dueDate) {
            daysDiff = Math.ceil((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          }

          return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            subtotal: invoice.subtotal.toNumber(),
            btwRate: invoice.btwRate.toNumber(),
            btwAmount: invoice.btwAmount.toNumber(),
            totalAmount: invoice.totalAmount.toNumber(),
            status: actualStatus,
            paymentMethod: invoice.paymentMethod,
            paymentDate: invoice.paymentDate,
            notes: invoice.notes,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            customer: invoice.customer ? {
              id: invoice.customer.id,
              name: invoice.customer.name,
              email: invoice.customer.email,
              phone: invoice.customer.phone,
              customerType: invoice.customer.customerType,
            } : null,
            plumber: {
              id: invoice.plumber.id,
              firstName: invoice.plumber.firstName,
              lastName: invoice.plumber.lastName,
              fullName: `${invoice.plumber.firstName} ${invoice.plumber.lastName}`,
              companyName: invoice.plumber.companyName,
              email: invoice.plumber.email,
            },
            jobs: invoice.jobs.map((job) => ({
              id: job.id,
              title: job.title,
              jobType: job.jobType,
              status: job.status,
              completedAt: job.completedAt,
            })),
            // Status indicators
            isOverdue: actualStatus === "overdue",
            daysOverdue: actualStatus === "overdue" ? daysDiff : 0,
            daysToDue: actualStatus === "sent" && daysDiff < 0 ? Math.abs(daysDiff) : 0,
          };
        }),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get invoice by ID with full details
   */
  byId: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      const invoice = await db.invoice.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
        include: {
          customer: true,
          plumber: true,
          jobs: {
            include: {
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Calculate job-based line items
      const jobLineItems = invoice.jobs.map((job) => {
        const laborCost = (job.laborHours?.toNumber() || 0) * (job.hourlyRate?.toNumber() || 0);
        const materialsCost = job.materialsCost?.toNumber() || 0;
        const subtotal = laborCost + materialsCost;

        return {
          type: "job" as const,
          jobId: job.id,
          description: job.title,
          laborHours: job.laborHours?.toNumber(),
          hourlyRate: job.hourlyRate?.toNumber(),
          laborCost,
          materialsUsed: job.materialsUsed,
          materialsCost,
          subtotal,
        };
      });

      // Determine actual status
      const actualStatus = invoice.status === "sent" && invoice.dueDate && invoice.dueDate < new Date()
        ? "overdue"
        : invoice.status;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        subtotal: invoice.subtotal.toNumber(),
        btwRate: invoice.btwRate.toNumber(),
        btwAmount: invoice.btwAmount.toNumber(),
        totalAmount: invoice.totalAmount.toNumber(),
        status: actualStatus,
        paymentMethod: invoice.paymentMethod,
        paymentDate: invoice.paymentDate,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        customer: {
          id: invoice.customer!.id,
          name: invoice.customer!.name,
          email: invoice.customer!.email,
          phone: invoice.customer!.phone,
          streetAddress: invoice.customer!.streetAddress,
          postalCode: invoice.customer!.postalCode,
          city: invoice.customer!.city,
          customerType: invoice.customer!.customerType,
        },
        plumber: {
          id: invoice.plumber.id,
          firstName: invoice.plumber.firstName,
          lastName: invoice.plumber.lastName,
          companyName: invoice.plumber.companyName,
          email: invoice.plumber.email,
          phone: invoice.plumber.phone,
          hourlyRate: invoice.plumber.hourlyRate?.toNumber(),
        },
        // Line items breakdown
        lineItems: jobLineItems,
        jobs: invoice.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          description: job.description,
          jobType: job.jobType,
          status: job.status,
          scheduledAt: job.scheduledAt,
          completedAt: job.completedAt,
          laborHours: job.laborHours?.toNumber(),
          hourlyRate: job.hourlyRate?.toNumber(),
          materialsUsed: job.materialsUsed,
          materialsCost: job.materialsCost?.toNumber(),
          notes: job.notes,
        })),
      };
    }),

  /**
   * Create invoice from completed jobs
   */
  create: orgProtectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId, userId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Get the current user's plumber record
      const currentPlumber = await db.plumber.findUnique({
        where: { clerkUserId: userId },
      });

      if (!currentPlumber) {
        throw new Error("Plumber profile not found");
      }

      // Verify customer exists
      const customer = await db.customer.findUnique({
        where: {
          id: input.customerId,
          organizationId: organization.id,
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Verify jobs exist and are completed
      const jobs = await db.job.findMany({
        where: {
          id: { in: input.jobIds },
          organizationId: organization.id,
          customerId: input.customerId,
          status: "completed",
        },
      });

      if (jobs.length !== input.jobIds.length) {
        throw new Error("Some jobs not found or not completed");
      }

      // Check if any jobs are already invoiced
      const existingInvoices = await db.invoice.findMany({
        where: {
          jobs: {
            some: {
              id: { in: input.jobIds },
            },
          },
        },
        include: {
          jobs: {
            select: { id: true },
          },
        },
      });

      if (existingInvoices.length > 0) {
        const invoicedJobIds = existingInvoices.flatMap(inv => inv.jobs.map(j => j.id));
        const conflictJobIds = input.jobIds.filter(id => invoicedJobIds.includes(id));
        throw new Error(`Jobs ${conflictJobIds.join(", ")} are already invoiced`);
      }

      // Calculate subtotal from jobs
      let subtotal = 0;

      for (const job of jobs) {
        const laborCost = (job.laborHours?.toNumber() || 0) * (job.hourlyRate?.toNumber() || 0);
        const materialsCost = job.materialsCost?.toNumber() || 0;
        subtotal += laborCost + materialsCost;
      }

      // Add custom line items
      for (const item of input.customLineItems) {
        subtotal += item.quantity * item.unitPrice;
      }

      // Calculate BTW
      const { btwAmount, totalAmount } = calculateBTW(subtotal, input.btwRate);

      // Generate invoice number
      const invoiceYear = input.invoiceDate.getFullYear();
      const invoiceNumber = await generateInvoiceNumber(db, organization.id, invoiceYear);

      // Set due date (default: 30 days from invoice date)
      const dueDate = input.dueDate || new Date(input.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create invoice
      const invoice = await db.invoice.create({
        data: {
          organizationId: organization.id,
          plumberId: currentPlumber.id,
          customerId: input.customerId,
          invoiceNumber,
          invoiceDate: input.invoiceDate,
          dueDate,
          subtotal,
          btwRate: input.btwRate,
          btwAmount,
          totalAmount,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          jobs: {
            connect: input.jobIds.map(id => ({ id })),
          },
        },
        include: {
          customer: true,
          jobs: true,
        },
      });

      return {
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount.toNumber(),
          customer: invoice.customer!.name,
          jobCount: invoice.jobs.length,
        },
      };
    }),

  /**
   * Update invoice (status, payment info, etc.)
   */
  update: orgProtectedProcedure
    .input(updateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Verify invoice exists and belongs to organization
      const existingInvoice = await db.invoice.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
      });

      if (!existingInvoice) {
        throw new Error("Invoice not found");
      }

      // Prepare update data
      const updateData: any = {};

      Object.keys(input).forEach((key) => {
        if (key !== "id" && input[key as keyof typeof input] !== undefined) {
          updateData[key] = input[key as keyof typeof input];
        }
      });

      // If marking as paid, ensure payment date is set
      if (input.status === "paid" && !input.paymentDate) {
        updateData.paymentDate = new Date();
      }

      // If changing from paid to another status, clear payment date
      if (input.status && input.status !== "paid" && existingInvoice.status === "paid") {
        updateData.paymentDate = null;
      }

      const updatedInvoice = await db.invoice.update({
        where: { id: input.id },
        data: updateData,
        include: {
          customer: true,
        },
      });

      return {
        success: true,
        invoice: {
          id: updatedInvoice.id,
          invoiceNumber: updatedInvoice.invoiceNumber,
          status: updatedInvoice.status,
          totalAmount: updatedInvoice.totalAmount.toNumber(),
          customer: updatedInvoice.customer!.name,
          paymentDate: updatedInvoice.paymentDate,
        },
      };
    }),

  /**
   * Delete invoice (only if draft)
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Verify invoice exists and belongs to organization
      const existingInvoice = await db.invoice.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
      });

      if (!existingInvoice) {
        throw new Error("Invoice not found");
      }

      // Only allow deletion of draft invoices
      if (existingInvoice.status !== "draft") {
        throw new Error("Only draft invoices can be deleted");
      }

      await db.invoice.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get completed jobs available for invoicing
   */
  getCompletedJobs: orgProtectedProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, orgId, userId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Get the current user's plumber record
      const currentPlumber = await db.plumber.findUnique({
        where: { clerkUserId: userId },
      });

      const where: any = {
        organizationId: organization.id,
        customerId: input.customerId,
        status: "completed",
        invoices: {
          none: {}, // Not already invoiced
        },
      };

      // Filter by plumber if not admin
      if (currentPlumber) {
        where.plumberId = currentPlumber.id;
      }

      const jobs = await db.job.findMany({
        where,
        orderBy: { completedAt: "desc" },
      });

      return jobs.map((job) => {
        const laborCost = (job.laborHours?.toNumber() || 0) * (job.hourlyRate?.toNumber() || 0);
        const materialsCost = job.materialsCost?.toNumber() || 0;
        const totalCost = laborCost + materialsCost;

        return {
          id: job.id,
          title: job.title,
          description: job.description,
          jobType: job.jobType,
          completedAt: job.completedAt,
          laborHours: job.laborHours?.toNumber(),
          hourlyRate: job.hourlyRate?.toNumber(),
          laborCost,
          materialsUsed: job.materialsUsed,
          materialsCost,
          totalCost,
        };
      });
    }),

  /**
   * Get invoice statistics
   */
  stats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { db, orgId } = ctx;

    const organization = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidThisMonth,
      totalOutstanding,
    ] = await Promise.all([
      // Total invoices
      db.invoice.count({
        where: { organizationId: organization.id },
      }),

      // Pending invoices (sent but not paid)
      db.invoice.count({
        where: {
          organizationId: organization.id,
          status: "sent",
        },
      }),

      // Overdue invoices
      db.invoice.count({
        where: {
          organizationId: organization.id,
          status: "sent",
          dueDate: { lt: today },
        },
      }),

      // Revenue this month
      db.invoice.aggregate({
        where: {
          organizationId: organization.id,
          status: "paid",
          paymentDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),

      // Outstanding amount
      db.invoice.aggregate({
        where: {
          organizationId: organization.id,
          status: { in: ["sent", "draft"] },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidThisMonth: paidThisMonth._sum.totalAmount?.toNumber() || 0,
      totalOutstanding: totalOutstanding._sum.totalAmount?.toNumber() || 0,
    };
  }),

  /**
   * Calculate BTW for preview
   */
  calculateBTW: orgProtectedProcedure
    .input(z.object({
      subtotal: z.number().positive(),
      btwRate: z.number().min(0).max(100).default(21),
    }))
    .query(({ input }) => {
      return calculateBTW(input.subtotal, input.btwRate);
    }),

  /**
   * Send invoice reminder (placeholder for email integration)
   */
  sendReminder: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;

      const organization = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      const invoice = await db.invoice.findUnique({
        where: {
          id: input.id,
          organizationId: organization.id,
        },
        include: {
          customer: true,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status !== "sent") {
        throw new Error("Can only send reminders for sent invoices");
      }

      // TODO: Implement email sending logic here
      // For now, just return success

      return {
        success: true,
        message: `Reminder sent to ${invoice.customer!.name}`,
      };
    }),
});