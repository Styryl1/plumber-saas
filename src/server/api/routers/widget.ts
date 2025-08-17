import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly with environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Widget Chat Router - Public API for embedded chatbot
 * Handles chat sessions, messages, and booking requests
 */
export const widgetRouter = createTRPCRouter({
  // Start a new chat session
  startSession: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      browserFingerprint: z.string().optional(),
      language: z.enum(["nl", "en"]).default("nl"),
    }))
    .mutation(async ({ ctx, input }) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: session, error } = await supabaseAdmin
        .from('chat_sessions')
        .insert({
          sessionId,
          browserFingerprint: input.browserFingerprint,
          preferredLanguage: input.language,
          isActive: true,
          totalMessages: 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error("Failed to create chat session");
      }

      return {
        sessionId: session.sessionId,
        language: session.preferredLanguage,
      };
    }),

  // Send a chat message and get AI response
  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      organizationId: z.string(),
      userMessage: z.string(),
      language: z.enum(["nl", "en"]).default("nl"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get session to track message number
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('*')
        .eq('sessionId', input.sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error("Session not found");
      }

      const messageNumber = session.totalMessages + 1;

      // AI response logic (simplified for demo)
      const aiResponse = await generateAIResponse(input.userMessage, input.language, input.organizationId);

      // Log the chat interaction
      const { error: chatLogError } = await supabaseAdmin
        .from('chat_logs')
        .insert({
          organizationId: input.organizationId,
          sessionId: input.sessionId,
          userMessage: input.userMessage,
          aiResponse: aiResponse.text,
          messageNumber,
          language: input.language,
          urgency: aiResponse.urgency,
          category: aiResponse.categories,
          estimatedCost: aiResponse.estimatedCost,
          travelTime: aiResponse.travelTime,
          customerPhone: aiResponse.customerPhone,
          customerName: aiResponse.customerName,
          location: aiResponse.location,
        });

      if (chatLogError) {
        throw new Error("Failed to save chat log");
      }

      // Update session
      const { error: updateError } = await supabaseAdmin
        .from('chat_sessions')
        .update({
          totalMessages: messageNumber,
          lastActivity: new Date().toISOString(),
          customerName: aiResponse.customerName || session.customerName,
          customerPhone: aiResponse.customerPhone || session.customerPhone,
          location: aiResponse.location || session.location,
          currentIssues: aiResponse.categories,
        })
        .eq('sessionId', input.sessionId);

      if (updateError) {
        throw new Error("Failed to update session");
      }

      return {
        response: aiResponse.text,
        urgency: aiResponse.urgency,
        categories: aiResponse.categories,
        estimatedCost: aiResponse.estimatedCost,
        shouldShowBookingForm: aiResponse.shouldShowBookingForm,
        messageNumber,
      };
    }),

  // Submit a booking request from the widget
  submitBooking: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      organizationId: z.string(),
      customerName: z.string(),
      customerPhone: z.string(),
      customerEmail: z.string().optional(),
      serviceType: z.string(),
      urgency: z.enum(["normal", "urgent", "emergency"]).default("normal"),
      description: z.string().optional(),
      address: z.string(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      preferredDate: z.date().optional(),
      preferredTime: z.string().optional(),
      flexibleTiming: z.boolean().default(false),
      language: z.enum(["nl", "en"]).default("nl"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create booking record
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          organizationId: input.organizationId,
          sessionId: input.sessionId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          serviceType: input.serviceType,
          urgency: input.urgency,
          description: input.description,
          address: input.address,
          postalCode: input.postalCode,
          city: input.city,
          preferredDate: input.preferredDate?.toISOString(),
          preferredTime: input.preferredTime,
          flexibleTiming: input.flexibleTiming,
          language: input.language,
          status: "new",
        })
        .select()
        .single();

      if (bookingError || !booking) {
        throw new Error("Failed to create booking");
      }

      // Update session to mark booking submitted
      const { error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .update({
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          resolvedIssues: ["booking_submitted"], // Replace array instead of push for Supabase
        })
        .eq('sessionId', input.sessionId);

      if (sessionError) {
        console.warn("Failed to update session:", sessionError);
      }

      return {
        bookingId: booking.id,
        status: "submitted",
        message: input.language === "nl" 
          ? "Uw aanvraag is succesvol verzonden! We nemen binnen 30 minuten contact met u op."
          : "Your request has been submitted successfully! We'll contact you within 30 minutes.",
      };
    }),

  // Submit feedback for the chat experience
  submitFeedback: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      organizationId: z.string(),
      type: z.enum(["helpful", "not_helpful", "suggestion", "complaint"]),
      rating: z.number().min(1).max(5).optional(),
      message: z.string().optional(),
      category: z.enum(["ai_response", "booking_process", "general"]).optional(),
      customerEmail: z.string().optional(),
      customerPhone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: feedback, error: feedbackError } = await supabaseAdmin
        .from('feedback')
        .insert({
          organizationId: input.organizationId,
          sessionId: input.sessionId,
          type: input.type,
          rating: input.rating,
          message: input.message,
          category: input.category,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          status: "new",
        })
        .select()
        .single();

      if (feedbackError || !feedback) {
        throw new Error("Failed to submit feedback");
      }

      return {
        feedbackId: feedback.id,
        message: "Thank you for your feedback!",
      };
    }),

  // Get organization's chat configuration
  getOrganizationConfig: publicProcedure
    .input(z.object({
      organizationSlug: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      console.log("getOrganizationConfig called with:", { input, ctx });
      
      const orgSlug = input.organizationSlug;
      console.log("Using org slug:", orgSlug);
      
      const { data: organization, error } = await supabaseAdmin
        .from('organizations')
        .select('id, name, chatEnabled, aiPersonality, domain')
        .eq('slug', orgSlug)
        .single();

      console.log("Supabase query result:", { organization, error });

      if (error || !organization || !organization.chatEnabled) {
        throw new Error("Chat not available for this organization");
      }

      return {
        id: organization.id,
        name: organization.name,
        aiPersonality: organization.aiPersonality,
        chatEnabled: organization.chatEnabled,
      };
    }),
});

/**
 * AI Response Generator
 * This is a simplified version - in production you'd use OpenAI, Claude, or similar
 */
async function generateAIResponse(
  userMessage: string, 
  language: "nl" | "en", 
  organizationId: string
): Promise<{
  text: string;
  urgency: string;
  categories: string[];
  estimatedCost?: number;
  travelTime?: number;
  customerPhone?: string;
  customerName?: string;
  location?: string;
  shouldShowBookingForm: boolean;
}> {
  const message = userMessage.toLowerCase();
  
  // Detect urgency
  const urgentKeywords = language === "nl" 
    ? ["spoedgeval", "lek", "overstroming", "geen warm water", "storing", "dringend"]
    : ["emergency", "leak", "flooding", "no hot water", "urgent", "immediate"];
  
  const isUrgent = urgentKeywords.some(keyword => message.includes(keyword));
  
  // Detect service categories  
  const categories: string[] = [];
  if (message.includes("lek") || message.includes("leak")) categories.push("leak_repair");
  if (message.includes("ketel") || message.includes("boiler")) categories.push("boiler_service");
  if (message.includes("afvoer") || message.includes("drain")) categories.push("drain_cleaning");
  if (message.includes("kraan") || message.includes("tap")) categories.push("tap_repair");
  
  // Extract phone/name patterns (simplified)
  const phoneMatch = message.match(/(\+31|0)[0-9\s-]{8,}/);
  const nameMatch = message.match(/mijn naam is ([a-zA-Z\s]+)/i) || message.match(/ik ben ([a-zA-Z\s]+)/i);
  
  // Generate context-aware response
  let responseText: string;
  let estimatedCost: number | undefined;
  let shouldShowBookingForm = false;
  
  if (isUrgent) {
    responseText = language === "nl"
      ? "Ik begrijp dat dit urgent is! Ik kan direct een loodgieter naar u toe sturen. Waar bevindt u zich en wat is uw telefoonnummer?"
      : "I understand this is urgent! I can send a plumber to you right away. Where are you located and what's your phone number?";
    shouldShowBookingForm = true;
  } else if (categories.length > 0) {
    if (categories.includes("boiler_service")) {
      estimatedCost = 125;
      responseText = language === "nl"
        ? "Voor ketelonderhoud rekenen we meestal €125-175. Wat voor ketel heeft u en welke problemen ervaart u?"
        : "For boiler service we typically charge €125-175. What type of boiler do you have and what issues are you experiencing?";
    } else if (categories.includes("leak_repair")) {
      estimatedCost = 85;
      responseText = language === "nl"
        ? "Een lek repareren kost meestal €85-150 afhankelijk van de locatie. Waar is het lek precies en hoe erg is het?"
        : "Leak repair typically costs €85-150 depending on location. Where exactly is the leak and how severe is it?";
    } else {
      responseText = language === "nl"
        ? "Ik kan u helpen met uw loodgieterswerk! Kunt u me meer vertellen over het probleem?"
        : "I can help you with your plumbing work! Can you tell me more about the problem?";
    }
  } else {
    responseText = language === "nl"
      ? "Hallo! Ik ben uw AI loodgieter-assistent. Waarmee kan ik u helpen vandaag?"
      : "Hello! I'm your AI plumber assistant. How can I help you today?";
  }
  
  return {
    text: responseText,
    urgency: isUrgent ? "emergency" : categories.length > 0 ? "normal" : "info",
    categories,
    estimatedCost,
    customerPhone: phoneMatch?.[0],
    customerName: nameMatch?.[1],
    shouldShowBookingForm,
  };
}