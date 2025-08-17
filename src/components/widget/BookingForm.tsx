"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { X, Calendar, Clock, MapPin, Phone, Mail, User } from "lucide-react";

interface BookingFormProps {
  sessionId: string;
  organizationId: string;
  language: "nl" | "en";
  primaryColor: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingForm({
  sessionId,
  organizationId,
  language,
  primaryColor,
  onClose,
  onSuccess,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceType: "",
    urgency: "normal" as "normal" | "urgent" | "emergency",
    description: "",
    address: "",
    postalCode: "",
    city: "",
    preferredDate: "",
    preferredTime: "",
    flexibleTiming: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const submitBookingMutation = api.widget.submitBooking.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitBookingMutation.mutate({
      sessionId,
      organizationId,
      ...formData,
      preferredDate: formData.preferredDate ? new Date(formData.preferredDate) : undefined,
      language,
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.customerName && formData.customerPhone && formData.serviceType;
      case 2:
        return formData.address;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const text = {
    nl: {
      title: "Afspraak inplannen",
      step: "Stap",
      of: "van",
      next: "Volgende",
      previous: "Vorige",
      submit: "Versturen",
      cancel: "Annuleren",
      
      // Step 1
      personalInfo: "Persoonlijke gegevens",
      name: "Naam",
      namePlaceholder: "Uw volledige naam",
      phone: "Telefoonnummer",
      phonePlaceholder: "+31 6 12345678",
      email: "E-mail (optioneel)",
      emailPlaceholder: "uw.email@example.com",
      serviceType: "Type service",
      serviceTypePlaceholder: "Selecteer type service",
      
      // Step 2
      locationInfo: "Locatie gegevens",
      address: "Adres",
      addressPlaceholder: "Straatnaam en huisnummer",
      postalCode: "Postcode",
      postalCodePlaceholder: "1234 AB",
      city: "Plaats",
      cityPlaceholder: "Amsterdam",
      description: "Beschrijving probleem",
      descriptionPlaceholder: "Beschrijf kort het probleem...",
      
      // Step 3
      scheduling: "Planning voorkeur",
      urgency: "Urgentie",
      normal: "Normaal",
      urgent: "Urgent",
      emergency: "Spoedgeval",
      preferredDate: "Voorkeursdatum",
      preferredTime: "Voorkeurtijd",
      morning: "Ochtend",
      afternoon: "Middag",
      evening: "Avond",
      flexible: "Ik ben flexibel met timing",
      
      // Services
      services: {
        leak_repair: "Lek reparatie",
        drain_cleaning: "Afvoer ontstoppen",
        boiler_service: "Ketel onderhoud",
        tap_repair: "Kraan reparatie",
        pipe_installation: "Leiding installatie",
        bathroom_renovation: "Badkamer renovatie",
        emergency_service: "Spoeddienst",
        other: "Anders",
      },
    },
    en: {
      title: "Schedule appointment",
      step: "Step",
      of: "of",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      cancel: "Cancel",
      
      // Step 1
      personalInfo: "Personal information",
      name: "Name",
      namePlaceholder: "Your full name",
      phone: "Phone number",
      phonePlaceholder: "+31 6 12345678",
      email: "Email (optional)",
      emailPlaceholder: "your.email@example.com",
      serviceType: "Service type",
      serviceTypePlaceholder: "Select service type",
      
      // Step 2
      locationInfo: "Location details",
      address: "Address",
      addressPlaceholder: "Street name and number",
      postalCode: "Postal code",
      postalCodePlaceholder: "1234 AB",
      city: "City",
      cityPlaceholder: "Amsterdam",
      description: "Problem description",
      descriptionPlaceholder: "Briefly describe the problem...",
      
      // Step 3
      scheduling: "Scheduling preference",
      urgency: "Urgency",
      normal: "Normal",
      urgent: "Urgent",
      emergency: "Emergency",
      preferredDate: "Preferred date",
      preferredTime: "Preferred time",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      flexible: "I'm flexible with timing",
      
      // Services
      services: {
        leak_repair: "Leak repair",
        drain_cleaning: "Drain cleaning",
        boiler_service: "Boiler service",
        tap_repair: "Tap repair",
        pipe_installation: "Pipe installation",
        bathroom_renovation: "Bathroom renovation",
        emergency_service: "Emergency service",
        other: "Other",
      },
    },
  };

  const t = text[language];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{t.step} {currentStep} {t.of} {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: primaryColor,
                width: `${(currentStep / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                  {t.personalInfo}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.name} *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder={t.namePlaceholder}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder={t.phonePlaceholder}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder={t.emailPlaceholder}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.serviceType} *
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                    required
                  >
                    <option value="">{t.serviceTypePlaceholder}</option>
                    {Object.entries(t.services).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                  {t.locationInfo}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.address} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t.addressPlaceholder}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.postalCode}
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder={t.postalCodePlaceholder}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ focusRingColor: primaryColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={t.cityPlaceholder}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ focusRingColor: primaryColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.description}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t.descriptionPlaceholder}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Scheduling */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                  {t.scheduling}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.urgency}
                  </label>
                  <div className="space-y-2">
                    {['normal', 'urgent', 'emergency'].map((urgency) => (
                      <label key={urgency} className="flex items-center">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency}
                          checked={formData.urgency === urgency}
                          onChange={handleInputChange}
                          className="mr-2"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-sm">
                          {t[urgency as keyof typeof t] as string}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.preferredDate}
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={minDate}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.preferredTime}
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: primaryColor }}
                  >
                    <option value="">{t.preferredTime}</option>
                    <option value="morning">{t.morning}</option>
                    <option value="afternoon">{t.afternoon}</option>
                    <option value="evening">{t.evening}</option>
                  </select>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="flexibleTiming"
                    checked={formData.flexibleTiming}
                    onChange={handleInputChange}
                    className="mr-2"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm">{t.flexible}</span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePrevStep}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              {currentStep === 1 ? t.cancel : t.previous}
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStepValid()}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {t.next}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitBookingMutation.isLoading || !isStepValid()}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {submitBookingMutation.isLoading ? "..." : t.submit}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}