"use client";

import React, { useState } from "react";
import { VoiceInvoiceInput } from "~/components/voice/VoiceInvoiceInput";
import { RealtimeChatMonitor } from "~/components/realtime/RealtimeChatMonitor";
import { Mic, MessageSquare, FileText, Globe, Volume2, TestTube } from "lucide-react";

export default function VoiceTestPage() {
  const [language, setLanguage] = useState<"nl" | "en">("nl");
  const [selectedTab, setSelectedTab] = useState<"voice" | "chat" | "integration">("voice");
  const [testInvoices, setTestInvoices] = useState<any[]>([]);

  // Mock organization and plumber data for testing
  const mockOrganizationId = "test-org-123";
  const mockPlumberId = "test-plumber-456";

  const handleInvoiceCreated = (invoice: any) => {
    setTestInvoices(prev => [invoice, ...prev]);
    
    // Show success notification
    if (Notification.permission === 'granted') {
      new Notification('Voice Invoice Created', {
        body: `Invoice ${invoice.invoiceNumber} for €${invoice.totalAmount}`,
        icon: '/favicon.ico',
      });
    }
  };

  const handleNewBooking = (booking: any) => {
    console.log("New booking received:", booking);
  };

  const handleNewFeedback = (feedback: any) => {
    console.log("New feedback received:", feedback);
  };

  const voiceExamples = {
    nl: [
      {
        title: "Basis Factuur",
        text: "Twee uur werk bij meneer de Vries, 50 euro materiaal voor kraan reparatie",
        expected: "2 uur × €75 + €50 materiaal = €200 subtotaal, €242 totaal (incl. BTW)"
      },
      {
        title: "Spoedklus",
        text: "Drie uur spoedwerk bij mevrouw Jansen, 120 euro onderdelen, lekkage reparatie",
        expected: "3 uur × €75 + €120 onderdelen = €345 subtotaal, €417.45 totaal"
      },
      {
        title: "Ketel Onderhoud",
        text: "Eén uur ketelonderhoud, 25 euro filters, klant Jan Pietersen",
        expected: "1 uur × €75 + €25 filters = €100 subtotaal, €121 totaal"
      },
      {
        title: "Badkamer Reparatie",
        text: "Vier uur werk, 200 euro materialen, nieuwe douche installatie",
        expected: "4 uur × €75 + €200 materialen = €500 subtotaal, €605 totaal"
      },
    ],
    en: [
      {
        title: "Basic Invoice",
        text: "Two hours work for Mr. Smith, 50 euros materials for tap repair",
        expected: "2 hours × €75 + €50 materials = €200 subtotal, €242 total (incl. VAT)"
      },
      {
        title: "Emergency Job",
        text: "Three hours emergency work for Mrs. Johnson, 120 euros parts, leak repair",
        expected: "3 hours × €75 + €120 parts = €345 subtotal, €417.45 total"
      },
      {
        title: "Boiler Service",
        text: "One hour boiler maintenance, 25 euros filters, customer John Peterson",
        expected: "1 hour × €75 + €25 filters = €100 subtotal, €121 total"
      },
      {
        title: "Bathroom Repair",
        text: "Four hours work, 200 euros materials, new shower installation",
        expected: "4 hours × €75 + €200 materials = €500 subtotal, €605 total"
      },
    ],
  };

  const tabContent = {
    voice: {
      title: language === "nl" ? "Spraak naar Factuur Test" : "Voice to Invoice Test",
      description: language === "nl" 
        ? "Test de spraakherkenning en factuur generatie functionaliteit"
        : "Test the speech recognition and invoice generation functionality",
    },
    chat: {
      title: language === "nl" ? "Live Chat Monitor Test" : "Live Chat Monitor Test",
      description: language === "nl"
        ? "Monitor real-time chat berichten en klant interacties"
        : "Monitor real-time chat messages and customer interactions",
    },
    integration: {
      title: language === "nl" ? "Integratie Testen" : "Integration Testing",
      description: language === "nl"
        ? "Test de complete functionaliteit en API integraties"
        : "Test the complete functionality and API integrations",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "nl" ? "Voice & Real-time Test Pagina" : "Voice & Real-time Test Page"}
          </h1>
          <p className="text-gray-600">
            {language === "nl"
              ? "Test de spraak-naar-factuur functionaliteit en real-time chat monitoring"
              : "Test the voice-to-invoice functionality and real-time chat monitoring"}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {language === "nl" ? "Taal" : "Language"}:
            </span>
            <button
              onClick={() => setLanguage("nl")}
              className={`px-3 py-1 rounded text-sm ${
                language === "nl"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Nederlands
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded text-sm ${
                language === "en"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSelectedTab("voice")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === "voice"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              {language === "nl" ? "Spraak Test" : "Voice Test"}
            </button>
            <button
              onClick={() => setSelectedTab("chat")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === "chat"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {language === "nl" ? "Chat Monitor" : "Chat Monitor"}
            </button>
            <button
              onClick={() => setSelectedTab("integration")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === "integration"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {language === "nl" ? "Integratie" : "Integration"}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {tabContent[selectedTab].title}
          </h2>
          <p className="text-gray-600">{tabContent[selectedTab].description}</p>
        </div>

        {/* Voice Test Tab */}
        {selectedTab === "voice" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice Input Component */}
            <div className="lg:col-span-2">
              <VoiceInvoiceInput
                organizationId={mockOrganizationId}
                plumberId={mockPlumberId}
                language={language}
                onInvoiceCreated={handleInvoiceCreated}
              />
            </div>

            {/* Examples and Results */}
            <div className="space-y-6">
              {/* Examples */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
                  {language === "nl" ? "Voorbeeld Zinnen" : "Example Sentences"}
                </h3>
                <div className="space-y-4">
                  {voiceExamples[language].map((example, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900 mb-1">{example.title}</h4>
                      <p className="text-sm text-gray-700 mb-2 italic">"{example.text}"</p>
                      <p className="text-xs text-gray-500">{example.expected}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Invoices */}
              {testInvoices.length > 0 && (
                <div className="bg-white rounded-lg border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    {language === "nl" ? "Gegenereerde Facturen" : "Generated Invoices"}
                  </h3>
                  <div className="space-y-3">
                    {testInvoices.map((invoice, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-green-800">
                            {invoice.invoiceNumber}
                          </span>
                          <span className="text-lg font-bold text-green-900">
                            €{invoice.totalAmount}
                          </span>
                        </div>
                        {invoice.customerName && (
                          <p className="text-sm text-green-700">
                            {language === "nl" ? "Klant" : "Customer"}: {invoice.customerName}
                          </p>
                        )}
                        <p className="text-xs text-green-600">
                          {language === "nl" ? "Subtotaal" : "Subtotal"}: €{invoice.subtotal} + 
                          BTW €{invoice.btwAmount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Monitor Tab */}
        {selectedTab === "chat" && (
          <div>
            <RealtimeChatMonitor
              organizationId={mockOrganizationId}
              language={language}
              onNewBooking={handleNewBooking}
              onNewFeedback={handleNewFeedback}
            />
          </div>
        )}

        {/* Integration Test Tab */}
        {selectedTab === "integration" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Status */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "nl" ? "API Status" : "API Status"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">tRPC Server</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supabase Database</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Real-time Subscriptions</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Speech Recognition</span>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "nl" ? "Test Acties" : "Test Actions"}
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm">
                  {language === "nl" ? "Test Widget Chat" : "Test Widget Chat"}
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm">
                  {language === "nl" ? "Test Booking Flow" : "Test Booking Flow"}
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm">
                  {language === "nl" ? "Test Voice Invoice" : "Test Voice Invoice"}
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded text-sm">
                  {language === "nl" ? "Test Real-time Updates" : "Test Real-time Updates"}
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "nl" ? "Performance" : "Performance"}
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">API Response Time</span>
                    <span className="text-gray-900">~150ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Speech Recognition</span>
                    <span className="text-gray-900">~2.5s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Real-time Latency</span>
                    <span className="text-gray-900">~50ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {language === "nl" ? "Test Instructies" : "Testing Instructions"}
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>1. {language === "nl" ? "Spraak Test" : "Voice Test"}:</strong> {" "}
              {language === "nl"
                ? "Klik op de microfoon knop en spreek een van de voorbeeld zinnen in. Controleer of de AI de juiste factuur details herkent."
                : "Click the microphone button and speak one of the example sentences. Check if the AI recognizes the correct invoice details."}
            </p>
            <p>
              <strong>2. {language === "nl" ? "Chat Monitor" : "Chat Monitor"}:</strong> {" "}
              {language === "nl"
                ? "Open de widget test pagina in een andere tab om real-time chat berichten te genereren en te monitoren."
                : "Open the widget test page in another tab to generate and monitor real-time chat messages."}
            </p>
            <p>
              <strong>3. {language === "nl" ? "Browser Permissies" : "Browser Permissions"}:</strong> {" "}
              {language === "nl"
                ? "Sta microfoon toegang en notificaties toe voor de beste test ervaring."
                : "Allow microphone access and notifications for the best testing experience."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}