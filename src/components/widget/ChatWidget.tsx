"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { MessageSquare, X, Send, Phone, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { BookingForm } from "./BookingForm";
import { FeedbackForm } from "./FeedbackForm";

// Generate a simple browser fingerprint for session tracking
function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') return 'server-side';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|');
  
  return btoa(fingerprint).slice(0, 16);
}

interface ChatWidgetProps {
  organizationSlug: string;
  language?: "nl" | "en";
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
  title?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  urgency?: string;
  categories?: string[];
  estimatedCost?: number;
  shouldShowBookingForm?: boolean;
}

export function ChatWidget({
  organizationSlug,
  language = "nl",
  position = "bottom-right",
  primaryColor = "#059669",
  title,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get organization config using tRPC
  const { data: orgConfig, isLoading: isConfigLoading, error: configError } = api.widget.getOrganizationConfig.useQuery(
    { organizationSlug },
    { 
      enabled: !!organizationSlug,
      retry: false,
      refetchOnWindowFocus: false
    }
  );

  useEffect(() => {
    if (orgConfig && !organizationId) {
      setOrganizationId(orgConfig.id);
      setOrganizationName(orgConfig.name);
    }
  }, [orgConfig, organizationId]);

  // Start session using tRPC
  const startSessionMutation = api.widget.startSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      console.log("Session started:", data.sessionId);
    },
    onError: (error) => {
      console.error("Failed to start session:", error.message);
    },
  });

  const startSession = async () => {
    if (!organizationId) return;
    
    startSessionMutation.mutate({
      organizationId,
      browserFingerprint: generateBrowserFingerprint(),
      language,
    });
  };

  // Send message using tRPC
  const sendMessageMutation = api.widget.sendMessage.useMutation({
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        urgency: data.urgency,
        categories: data.categories,
        estimatedCost: data.estimatedCost,
        shouldShowBookingForm: data.shouldShowBookingForm,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      if (data.shouldShowBookingForm) {
        setShowBookingForm(true);
      }
    },
    onError: (error) => {
      console.error("Failed to send message:", error.message);
      setIsTyping(false);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: language === "nl" 
          ? "Sorry, er ging iets mis. Probeer het opnieuw."
          : "Sorry, something went wrong. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const sendMessage = async (userMessage: string) => {
    if (!sessionId || !organizationId) return;
    
    sendMessageMutation.mutate({
      sessionId,
      organizationId,
      userMessage,
      language,
    });
  };

  // Initialize widget when organization config is loaded
  useEffect(() => {
    if (orgConfig && orgConfig.id && !sessionId && organizationId) {
      // Start chat session using tRPC
      startSession();
    }
  }, [orgConfig?.id, sessionId, organizationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message when session starts
  useEffect(() => {
    if (sessionId && messages.length === 0 && organizationName) {
      const welcomeMessage: Message = {
        id: "welcome",
        text: language === "nl"
          ? `Hallo! Ik ben de AI-assistent van ${organizationName}. Waarmee kan ik u helpen?`
          : `Hello! I'm the AI assistant for ${organizationName}. How can I help you?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [sessionId, messages.length, language, organizationName]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || !organizationId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    
    // Send message using direct API
    await sendMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    const successMessage: Message = {
      id: `booking-success-${Date.now()}`,
      text: language === "nl"
        ? "Bedankt! Uw aanvraag is verzonden. We nemen binnen 30 minuten contact met u op."
        : "Thank you! Your request has been sent. We'll contact you within 30 minutes.",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, successMessage]);
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Always show widget - handle API errors gracefully
  const displayName = orgConfig?.name || title || "Customer Support";
  const isConfigLoaded = !!orgConfig && !isConfigLoading;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-sans`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          style={{ backgroundColor: primaryColor }}
          aria-label={language === "nl" ? "Open chat" : "Open chat"}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col overflow-hidden border">
          {/* Header */}
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <h3 className="font-semibold text-sm">
                {displayName}
              </h3>
              <p className="text-xs opacity-90">
                {isConfigLoaded 
                  ? (language === "nl" ? "Online nu" : "Online now")
                  : (language === "nl" ? "Laden..." : "Loading...")
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFeedback(true)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                aria-label={language === "nl" ? "Feedback geven" : "Give feedback"}
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                aria-label={language === "nl" ? "Sluiten" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isUser
                      ? "text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  style={message.isUser ? { backgroundColor: primaryColor } : {}}
                >
                  <p>{message.text}</p>
                  {message.estimatedCost && (
                    <p className="text-xs mt-1 opacity-90">
                      {language === "nl" ? "Geschatte kosten" : "Estimated cost"}: €{message.estimatedCost}
                    </p>
                  )}
                  {message.urgency === "emergency" && (
                    <div className="flex items-center mt-2">
                      <Phone className="w-3 h-3 mr-1" />
                      <span className="text-xs">
                        {language === "nl" ? "Spoedgeval" : "Emergency"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === "nl"
                    ? "Typ uw bericht..."
                    : "Type your message..."
                }
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ focusRingColor: primaryColor }}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && sessionId && organizationId && (
        <BookingForm
          sessionId={sessionId}
          organizationId={organizationId}
          language={language}
          primaryColor={primaryColor}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && sessionId && organizationId && (
        <FeedbackForm
          sessionId={sessionId}
          organizationId={organizationId}
          language={language}
          primaryColor={primaryColor}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}