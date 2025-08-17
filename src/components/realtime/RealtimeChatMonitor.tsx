"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { createClient } from "@supabase/supabase-js";
import { MessageSquare, User, Clock, AlertCircle, Phone, MapPin, Euro } from "lucide-react";

interface RealtimeChatMonitorProps {
  organizationId: string;
  language?: "nl" | "en";
  onNewBooking?: (booking: any) => void;
  onNewFeedback?: (feedback: any) => void;
}

interface LiveChatMessage {
  id: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  messageNumber: number;
  urgency: string;
  categories: string[];
  customerName?: string;
  customerPhone?: string;
  location?: string;
  estimatedCost?: number;
  createdAt: string;
}

interface LiveSession {
  sessionId: string;
  isActive: boolean;
  customerName?: string;
  customerPhone?: string;
  location?: string;
  preferredLanguage: string;
  currentIssues: string[];
  lastActivity: string;
  messageCount: number;
}

export function RealtimeChatMonitor({
  organizationId,
  language = "nl",
  onNewBooking,
  onNewFeedback,
}: RealtimeChatMonitorProps) {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [recentMessages, setRecentMessages] = useState<LiveChatMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const supabaseRef = useRef<any>(null);

  // Get Supabase client
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    supabaseRef.current = createClient(supabaseUrl, supabaseKey);
    setIsConnected(true);
  }, []);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!supabaseRef.current || !organizationId) return;

    const chatLogsChannel = supabaseRef.current
      .channel('chat_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_logs',
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload: any) => {
          const newMessage: LiveChatMessage = {
            id: payload.new.id,
            sessionId: payload.new.sessionId,
            userMessage: payload.new.userMessage,
            aiResponse: payload.new.aiResponse,
            messageNumber: payload.new.messageNumber,
            urgency: payload.new.urgency,
            categories: payload.new.category || [],
            customerName: payload.new.customerName,
            customerPhone: payload.new.customerPhone,
            location: payload.new.location,
            estimatedCost: payload.new.estimatedCost,
            createdAt: payload.new.createdAt,
          };

          setRecentMessages(prev => [newMessage, ...prev.slice(0, 19)]); // Keep latest 20
          updateSessionFromMessage(newMessage);
        }
      )
      .subscribe();

    // Subscribe to bookings
    const bookingsChannel = supabaseRef.current
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload: any) => {
          onNewBooking?.(payload.new);
        }
      )
      .subscribe();

    // Subscribe to feedback
    const feedbackChannel = supabaseRef.current
      .channel('feedback_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback',
          filter: `organizationId=eq.${organizationId}`,
        },
        (payload: any) => {
          onNewFeedback?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      chatLogsChannel.unsubscribe();
      bookingsChannel.unsubscribe();
      feedbackChannel.unsubscribe();
    };
  }, [organizationId, onNewBooking, onNewFeedback]);

  // Get initial chat sessions and messages
  const { data: sessions } = api.chat.getSessions.useQuery({
    organizationId,
    status: "active",
    limit: 50,
  });

  const { data: chatHistory } = api.chat.getChatHistory.useQuery(
    {
      sessionId: selectedSession!,
      organizationId,
    },
    {
      enabled: !!selectedSession,
    }
  );

  // Update live sessions from initial data
  useEffect(() => {
    if (sessions) {
      const liveSessions: LiveSession[] = sessions.map(session => ({
        sessionId: session.sessionId,
        isActive: session.isActive,
        customerName: session.customerName || undefined,
        customerPhone: session.customerPhone || undefined,
        location: session.location || undefined,
        preferredLanguage: session.preferredLanguage,
        currentIssues: session.currentIssues || [],
        lastActivity: session.lastActivity.toISOString(),
        messageCount: session.chatLogsCount || 0,
      }));
      
      setLiveSessions(liveSessions);
    }
  }, [sessions]);

  const updateSessionFromMessage = (message: LiveChatMessage) => {
    setLiveSessions(prev => {
      const existingIndex = prev.findIndex(s => s.sessionId === message.sessionId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          customerName: message.customerName || updated[existingIndex].customerName,
          customerPhone: message.customerPhone || updated[existingIndex].customerPhone,
          location: message.location || updated[existingIndex].location,
          currentIssues: message.categories,
          lastActivity: message.createdAt,
          messageCount: message.messageNumber,
        };
        
        // Move to top
        const session = updated.splice(existingIndex, 1)[0];
        return [session, ...updated];
      } else {
        // New session
        const newSession: LiveSession = {
          sessionId: message.sessionId,
          isActive: true,
          customerName: message.customerName,
          customerPhone: message.customerPhone,
          location: message.location,
          preferredLanguage: language,
          currentIssues: message.categories,
          lastActivity: message.createdAt,
          messageCount: message.messageNumber,
        };
        
        return [newSession, ...prev];
      }
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return language === "nl" ? "Nu" : "Now";
    if (diffMins < 60) return `${diffMins}${language === "nl" ? "m" : "m"}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}${language === "nl" ? "u" : "h"}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}${language === "nl" ? "d" : "d"}`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "text-red-600 bg-red-50";
      case "urgent": return "text-orange-600 bg-orange-50";
      case "normal": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency": return <AlertCircle className="w-4 h-4" />;
      case "urgent": return <Clock className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const text = {
    nl: {
      title: "Live Chat Monitor",
      activeSessions: "Actieve Sessies",
      recentMessages: "Recente Berichten",
      noSessions: "Geen actieve chat sessies",
      noMessages: "Geen recente berichten",
      anonymous: "Anoniem",
      emergency: "Spoedgeval",
      urgent: "Urgent",
      normal: "Normaal",
      info: "Info",
      messages: "berichten",
      offline: "Offline",
      online: "Online",
      connecting: "Verbinden...",
    },
    en: {
      title: "Live Chat Monitor",
      activeSessions: "Active Sessions",
      recentMessages: "Recent Messages",
      noSessions: "No active chat sessions",
      noMessages: "No recent messages",
      anonymous: "Anonymous",
      emergency: "Emergency",
      urgent: "Urgent",
      normal: "Normal",
      info: "Info",
      messages: "messages",
      offline: "Offline",
      online: "Online",
      connecting: "Connecting...",
    },
  };

  const t = text[language];

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? t.online : t.offline}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Active Sessions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t.activeSessions}</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {liveSessions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t.noSessions}</p>
            ) : (
              liveSessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => setSelectedSession(session.sessionId)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSession === session.sessionId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-sm">
                          {session.customerName || t.anonymous}
                        </span>
                      </div>
                      
                      {session.customerPhone && (
                        <div className="flex items-center mt-1">
                          <Phone className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-600">
                            {session.customerPhone}
                          </span>
                        </div>
                      )}
                      
                      {session.location && (
                        <div className="flex items-center mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-600">
                            {session.location}
                          </span>
                        </div>
                      )}
                      
                      {session.currentIssues.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.currentIssues.slice(0, 2).map((issue, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {issue.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(session.lastActivity)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {session.messageCount} {t.messages}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t.recentMessages}</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t.noMessages}</p>
            ) : (
              recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`flex items-center px-2 py-1 rounded text-xs ${getUrgencyColor(message.urgency)}`}>
                        {getUrgencyIcon(message.urgency)}
                        <span className="ml-1 capitalize">{message.urgency}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(message.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="text-gray-800 mb-1">
                      <strong>{language === "nl" ? "Klant" : "Customer"}:</strong> {message.userMessage}
                    </div>
                    <div className="text-gray-600">
                      <strong>AI:</strong> {message.aiResponse}
                    </div>
                  </div>
                  
                  {message.estimatedCost && (
                    <div className="flex items-center mt-2 text-xs text-green-600">
                      <Euro className="w-3 h-3 mr-1" />
                      {language === "nl" ? "Geschat" : "Estimated"}: €{message.estimatedCost}
                    </div>
                  )}
                  
                  {message.customerName && (
                    <div className="text-xs text-gray-500 mt-1">
                      {message.customerName}
                      {message.customerPhone && ` • ${message.customerPhone}`}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Session Detail */}
      {selectedSession && chatHistory && (
        <div className="border-t p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Session Details: {chatHistory.session?.customerName || selectedSession.slice(0, 8)}
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {chatHistory.messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex">
                  <span className="font-medium text-blue-600 mr-2">
                    {msg.messageNumber}.
                  </span>
                  <div className="flex-1">
                    <div className="text-gray-800">{msg.userMessage}</div>
                    <div className="text-gray-600 mt-1">→ {msg.aiResponse}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}