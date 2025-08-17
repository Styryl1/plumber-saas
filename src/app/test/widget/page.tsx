"use client";

import React, { useState } from "react";
import { ChatWidget } from "~/components/widget/ChatWidget";
import { Settings, Palette, Globe, Monitor, Smartphone } from "lucide-react";

export default function WidgetTestPage() {
  const [config, setConfig] = useState({
    organizationSlug: "demo-plumber-amsterdam",
    language: "nl" as "nl" | "en",
    position: "bottom-right" as "bottom-right" | "bottom-left",
    primaryColor: "#059669",
    title: "",
  });

  const [viewportSize, setViewportSize] = useState("desktop" as "desktop" | "tablet" | "mobile");

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const presetColors = [
    { name: "Green", value: "#059669" },
    { name: "Blue", value: "#2563eb" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Orange", value: "#ea580c" },
    { name: "Red", value: "#dc2626" },
    { name: "Pink", value: "#db2777" },
  ];

  const getViewportClasses = () => {
    switch (viewportSize) {
      case "mobile":
        return "w-80 h-96 border-2 border-gray-300 rounded-lg bg-gray-100";
      case "tablet":
        return "w-96 h-[500px] border-2 border-gray-300 rounded-lg bg-gray-100";
      default:
        return "w-full h-full bg-gray-100";
    }
  };

  const testScenarios = [
    {
      name: "Emergency Leak",
      messages: [
        "Help! I have a water leak in my kitchen",
        "Water is everywhere, this is urgent!",
        "My name is Jan de Vries, phone 06-12345678",
        "Address is Damrak 123, Amsterdam",
      ],
    },
    {
      name: "Boiler Service",
      messages: [
        "My boiler is making strange noises",
        "It's not heating properly anymore",
        "How much would a service cost?",
        "I'm at Prinsengracht 456, Amsterdam",
      ],
    },
    {
      name: "Drain Cleaning",
      messages: [
        "My drain is blocked",
        "Water won't go down in the bathroom",
        "Can someone come today?",
        "I'm Marie van der Berg, 06-87654321",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chat Widget Test Page
          </h1>
          <p className="text-gray-600">
            Test the modern AI chatbot widget with different configurations and scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Widget Configuration
              </h2>

              <div className="space-y-4">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Language
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => handleConfigChange("language", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nl">Dutch (Nederlands)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={config.position}
                    onChange={(e) => handleConfigChange("position", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>

                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Primary Color
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {presetColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleConfigChange("primaryColor", color.value)}
                        className={`w-full h-8 rounded border-2 transition-all ${
                          config.primaryColor === color.value
                            ? "border-gray-800 scale-105"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange("primaryColor", e.target.value)}
                    className="w-full h-8 border rounded"
                  />
                </div>

                {/* Custom Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Title (optional)
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => handleConfigChange("title", e.target.value)}
                    placeholder="Chat with us"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Viewport Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Monitor className="w-4 h-4 inline mr-1" />
                    Viewport Size
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setViewportSize("desktop")}
                      className={`p-2 rounded text-xs ${
                        viewportSize === "desktop"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Monitor className="w-4 h-4 mx-auto mb-1" />
                      Desktop
                    </button>
                    <button
                      onClick={() => setViewportSize("tablet")}
                      className={`p-2 rounded text-xs ${
                        viewportSize === "tablet"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Monitor className="w-4 h-4 mx-auto mb-1" />
                      Tablet
                    </button>
                    <button
                      onClick={() => setViewportSize("mobile")}
                      className={`p-2 rounded text-xs ${
                        viewportSize === "mobile"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mx-auto mb-1" />
                      Mobile
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Scenarios */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Test Scenarios</h3>
                <div className="space-y-2">
                  {testScenarios.map((scenario, index) => (
                    <details key={index} className="border rounded p-2">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700">
                        {scenario.name}
                      </summary>
                      <div className="mt-2 space-y-1">
                        {scenario.messages.map((message, msgIndex) => (
                          <div key={msgIndex} className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                            {msgIndex + 1}. {message}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Code Example */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Implementation Code</h3>
                <div className="bg-gray-900 text-gray-100 text-xs p-3 rounded overflow-x-auto">
                  <pre>{`<ChatWidget
  organizationSlug="${config.organizationSlug}"
  language="${config.language}"
  position="${config.position}"
  primaryColor="${config.primaryColor}"
  ${config.title ? `title="${config.title}"` : ""}
/>`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Demo Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Widget Preview
              </h2>

              {/* Viewport Container */}
              <div className="flex justify-center">
                <div className={getViewportClasses()}>
                  <div className="relative w-full h-full overflow-hidden">
                    {/* Simulated Website Content */}
                    <div className="p-4 bg-white h-full">
                      <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {config.language === "nl" 
                            ? "Amsterdam Loodgietersbedrijf" 
                            : "Amsterdam Plumbing Services"}
                        </h1>
                        <p className="text-gray-600">
                          {config.language === "nl"
                            ? "24/7 spoedservice voor al uw loodgieterswerk"
                            : "24/7 emergency service for all your plumbing needs"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded">
                          <h3 className="font-semibold mb-2">
                            {config.language === "nl" ? "Onze Services" : "Our Services"}
                          </h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• {config.language === "nl" ? "Lek reparatie" : "Leak repair"}</li>
                            <li>• {config.language === "nl" ? "Ketel onderhoud" : "Boiler service"}</li>
                            <li>• {config.language === "nl" ? "Afvoer ontstoppen" : "Drain cleaning"}</li>
                            <li>• {config.language === "nl" ? "Badkamer renovatie" : "Bathroom renovation"}</li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 p-4 rounded">
                          <h3 className="font-semibold mb-2">
                            {config.language === "nl" ? "Contact" : "Contact"}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📞 +31 20 123 4567</p>
                            <p>📧 info@amsterdamplumber.nl</p>
                            <p>📍 Amsterdam, Nederland</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-gray-500 text-sm">
                        {config.language === "nl"
                          ? "↗️ Klik op de chat knop om een gesprek te starten"
                          : "↗️ Click the chat button to start a conversation"}
                      </div>
                    </div>

                    {/* Widget */}
                    <ChatWidget
                      organizationSlug={config.organizationSlug}
                      language={config.language}
                      position={config.position}
                      primaryColor={config.primaryColor}
                      title={config.title || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Widget Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Real-time Chat</h4>
                      <p className="text-xs text-gray-600">Instant AI responses with context awareness</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Booking Integration</h4>
                      <p className="text-xs text-gray-600">Seamless appointment scheduling</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Multi-language</h4>
                      <p className="text-xs text-gray-600">Dutch and English support</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Cost Estimation</h4>
                      <p className="text-xs text-gray-600">AI-powered pricing estimates</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Feedback System</h4>
                      <p className="text-xs text-gray-600">Built-in user feedback collection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Mobile Responsive</h4>
                      <p className="text-xs text-gray-600">Optimized for all devices</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Instructions */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Integration Instructions</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">1. Install Dependencies</h4>
                    <code className="text-xs text-blue-700">npm install @trpc/client @trpc/react-query</code>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">2. Import Widget</h4>
                    <code className="text-xs text-blue-700">import {`{ ChatWidget }`} from '~/components/widget'</code>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">3. Add to Your Page</h4>
                    <code className="text-xs text-blue-700">{"<ChatWidget organizationSlug=\"your-slug\" />"}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}