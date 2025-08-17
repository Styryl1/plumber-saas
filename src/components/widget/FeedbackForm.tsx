"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { X, Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

interface FeedbackFormProps {
  sessionId: string;
  organizationId: string;
  language: "nl" | "en";
  primaryColor: string;
  onClose: () => void;
}

export function FeedbackForm({
  sessionId,
  organizationId,
  language,
  primaryColor,
  onClose,
}: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    type: "" as "helpful" | "not_helpful" | "suggestion" | "complaint" | "",
    rating: 0,
    message: "",
    category: "" as "ai_response" | "booking_process" | "general" | "",
    customerEmail: "",
    customerPhone: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const submitFeedbackMutation = api.widget.submitFeedback.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleTypeClick = (type: "helpful" | "not_helpful" | "suggestion" | "complaint") => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) return;

    submitFeedbackMutation.mutate({
      sessionId,
      organizationId,
      type: formData.type,
      rating: formData.rating || undefined,
      message: formData.message || undefined,
      category: formData.category || undefined,
      customerEmail: formData.customerEmail || undefined,
      customerPhone: formData.customerPhone || undefined,
    });
  };

  const text = {
    nl: {
      title: "Feedback geven",
      subtitle: "Help ons onze service te verbeteren",
      question: "Hoe was uw ervaring?",
      helpful: "Nuttig",
      notHelpful: "Niet nuttig",
      suggestion: "Suggestie",
      complaint: "Klacht",
      rating: "Geef een beoordeling",
      category: "Categorie",
      categoryAiResponse: "AI antwoorden",
      categoryBookingProcess: "Boekingsproces",
      categoryGeneral: "Algemeen",
      message: "Bericht (optioneel)",
      messagePlaceholder: "Vertel ons meer over uw ervaring...",
      contact: "Contactgegevens (optioneel)",
      email: "E-mail",
      phone: "Telefoon",
      submit: "Versturen",
      cancel: "Annuleren",
      thankYou: "Bedankt voor uw feedback!",
      thankYouMessage: "Wij waarderen uw input en gebruiken het om onze service te verbeteren.",
    },
    en: {
      title: "Give feedback",
      subtitle: "Help us improve our service",
      question: "How was your experience?",
      helpful: "Helpful",
      notHelpful: "Not helpful",
      suggestion: "Suggestion",
      complaint: "Complaint",
      rating: "Give a rating",
      category: "Category",
      categoryAiResponse: "AI responses",
      categoryBookingProcess: "Booking process",
      categoryGeneral: "General",
      message: "Message (optional)",
      messagePlaceholder: "Tell us more about your experience...",
      contact: "Contact details (optional)",
      email: "Email",
      phone: "Phone",
      submit: "Submit",
      cancel: "Cancel",
      thankYou: "Thank you for your feedback!",
      thankYouMessage: "We appreciate your input and will use it to improve our service.",
    },
  };

  const t = text[language];

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t.thankYou}</h2>
          <p className="text-gray-600">{t.thankYouMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div>
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <p className="text-sm opacity-90">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-6">
            {/* Feedback Type */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{t.question}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeClick("helpful")}
                  className={`p-3 border rounded-lg text-sm flex items-center justify-center transition-colors ${
                    formData.type === "helpful"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {t.helpful}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeClick("not_helpful")}
                  className={`p-3 border rounded-lg text-sm flex items-center justify-center transition-colors ${
                    formData.type === "not_helpful"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {t.notHelpful}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeClick("suggestion")}
                  className={`p-3 border rounded-lg text-sm flex items-center justify-center transition-colors ${
                    formData.type === "suggestion"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t.suggestion}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeClick("complaint")}
                  className={`p-3 border rounded-lg text-sm flex items-center justify-center transition-colors ${
                    formData.type === "complaint"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t.complaint}
                </button>
              </div>
            </div>

            {/* Rating */}
            {formData.type && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">{t.rating}</h3>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 transition-colors ${
                        star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {formData.type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.category}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: primaryColor }}
                >
                  <option value="">{t.category}</option>
                  <option value="ai_response">{t.categoryAiResponse}</option>
                  <option value="booking_process">{t.categoryBookingProcess}</option>
                  <option value="general">{t.categoryGeneral}</option>
                </select>
              </div>
            )}

            {/* Message */}
            {formData.type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t.messagePlaceholder}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ focusRingColor: primaryColor }}
                />
              </div>
            )}

            {/* Contact Details */}
            {formData.type && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">{t.contact}</h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder={t.email}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                  />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder={t.phone}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            
            <button
              type="submit"
              disabled={!formData.type || submitFeedbackMutation.isLoading}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {submitFeedbackMutation.isLoading ? "..." : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}