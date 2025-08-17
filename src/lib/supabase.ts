import { createClient } from '@supabase/supabase-js';
import { env } from '~/env.mjs';

// Create Supabase client for client-side operations
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Create Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);

/**
 * Real-time subscription helper for chat monitoring
 */
export function subscribeToOrganizationUpdates(
  organizationId: string,
  callbacks: {
    onChatLog?: (payload: any) => void;
    onBooking?: (payload: any) => void;
    onFeedback?: (payload: any) => void;
    onJobUpdate?: (payload: any) => void;
  }
) {
  const channels: any[] = [];

  // Subscribe to chat logs
  if (callbacks.onChatLog) {
    const chatChannel = supabase
      .channel(`chat_logs_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_logs',
          filter: `organizationId=eq.${organizationId}`,
        },
        callbacks.onChatLog
      )
      .subscribe();
    
    channels.push(chatChannel);
  }

  // Subscribe to bookings
  if (callbacks.onBooking) {
    const bookingChannel = supabase
      .channel(`bookings_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `organizationId=eq.${organizationId}`,
        },
        callbacks.onBooking
      )
      .subscribe();
    
    channels.push(bookingChannel);
  }

  // Subscribe to feedback
  if (callbacks.onFeedback) {
    const feedbackChannel = supabase
      .channel(`feedback_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback',
          filter: `organizationId=eq.${organizationId}`,
        },
        callbacks.onFeedback
      )
      .subscribe();
    
    channels.push(feedbackChannel);
  }

  // Subscribe to job updates
  if (callbacks.onJobUpdate) {
    const jobChannel = supabase
      .channel(`jobs_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `organizationId=eq.${organizationId}`,
        },
        callbacks.onJobUpdate
      )
      .subscribe();
    
    channels.push(jobChannel);
  }

  // Return cleanup function
  return () => {
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  };
}

/**
 * Real-time subscription for specific chat session
 */
export function subscribeToChatSession(
  sessionId: string,
  onMessage: (payload: any) => void
) {
  const channel = supabase
    .channel(`chat_session_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_logs',
        filter: `sessionId=eq.${sessionId}`,
      },
      onMessage
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Real-time notifications for dashboard
 */
export function subscribeToDashboardNotifications(
  organizationId: string,
  onNotification: (notification: {
    type: 'new_booking' | 'urgent_chat' | 'new_feedback' | 'job_update';
    title: string;
    message: string;
    data: any;
    timestamp: Date;
  }) => void
) {
  // Monitor urgent chat messages
  const urgentChatChannel = supabase
    .channel(`urgent_chat_${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_logs',
        filter: `organizationId=eq.${organizationId}`,
      },
      (payload) => {
        if (payload.new.urgency === 'emergency') {
          onNotification({
            type: 'urgent_chat',
            title: 'Emergency Chat',
            message: payload.new.customerName 
              ? `Urgent message from ${payload.new.customerName}`
              : 'Urgent message from customer',
            data: payload.new,
            timestamp: new Date(),
          });
        }
      }
    )
    .subscribe();

  // Monitor new bookings
  const bookingChannel = supabase
    .channel(`new_bookings_${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `organizationId=eq.${organizationId}`,
      },
      (payload) => {
        onNotification({
          type: 'new_booking',
          title: 'New Booking',
          message: `New ${payload.new.urgency} booking from ${payload.new.customerName}`,
          data: payload.new,
          timestamp: new Date(),
        });
      }
    )
    .subscribe();

  // Monitor feedback
  const feedbackChannel = supabase
    .channel(`new_feedback_${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `organizationId=eq.${organizationId}`,
      },
      (payload) => {
        onNotification({
          type: 'new_feedback',
          title: 'New Feedback',
          message: `${payload.new.type} feedback received`,
          data: payload.new,
          timestamp: new Date(),
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(urgentChatChannel);
    supabase.removeChannel(bookingChannel);
    supabase.removeChannel(feedbackChannel);
  };
}

/**
 * Database types for TypeScript
 */
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          clerkOrgId: string;
          name: string;
          slug: string;
          domain: string | null;
          plan: string;
          status: string;
          btwNumber: string | null;
          kvkNumber: string | null;
          chatEnabled: boolean;
          aiPersonality: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      chat_logs: {
        Row: {
          id: string;
          organizationId: string;
          sessionId: string;
          userMessage: string;
          aiResponse: string;
          messageNumber: number;
          language: string;
          urgency: string;
          category: string[] | null;
          customerPhone: string | null;
          customerName: string | null;
          location: string | null;
          travelTime: number | null;
          estimatedCost: number | null;
          createdAt: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_logs']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['chat_logs']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          organizationId: string;
          sessionId: string | null;
          customerName: string;
          customerPhone: string;
          customerEmail: string | null;
          serviceType: string;
          urgency: string;
          description: string | null;
          address: string;
          postalCode: string | null;
          city: string | null;
          preferredDate: string | null;
          preferredTime: string | null;
          flexibleTiming: boolean;
          estimatedCost: number | null;
          estimatedDuration: number | null;
          status: string;
          jobId: string | null;
          assignedPlumberId: string | null;
          language: string;
          contactMethod: string;
          adminNotes: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}