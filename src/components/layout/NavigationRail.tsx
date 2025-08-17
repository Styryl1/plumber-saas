"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  MessageCircle, 
  Zap, 
  ChevronDown 
} from 'lucide-react';

interface NavigationRailProps {
  currentUser?: {
    name: string;
    initials: string;
  };
  jobsCount?: number;
  language: 'nl' | 'en';
  onLanguageChange: (lang: 'nl' | 'en') => void;
  onChatOpen: () => void;
}

const NavigationRail: React.FC<NavigationRailProps> = ({
  currentUser = { name: 'Jan de Reparateur', initials: 'J' },
  jobsCount = 0,
  language,
  onLanguageChange,
  onChatOpen
}) => {
  const pathname = usePathname();
  
  const translations = {
    nl: {
      aiAssistant: 'AI Assistent',
      speakWithAgent: 'Spreek met Agent',
      dashboard: 'Dashboard',
      jobs: 'Klussen',
      customers: 'Klanten',
      invoices: 'Facturen',
      currentProfile: 'Huidig Profiel'
    },
    en: {
      aiAssistant: 'AI Assistant',
      speakWithAgent: 'Talk to Agent',
      dashboard: 'Dashboard',
      jobs: 'Jobs',
      customers: 'Customers',
      invoices: 'Invoices',
      currentProfile: 'Current Profile'
    }
  };

  const t = translations[language];

  const navigationItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: t.dashboard,
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/jobs',
      icon: Calendar,
      label: t.jobs,
      badge: jobsCount > 0 ? jobsCount : undefined,
      active: pathname.startsWith('/dashboard/jobs')
    },
    {
      href: '/dashboard/customers',
      icon: Users,
      label: t.customers,
      active: pathname.startsWith('/dashboard/customers')
    },
    {
      href: '/dashboard/invoices',
      icon: FileText,
      label: t.invoices,
      active: pathname.startsWith('/dashboard/invoices')
    }
  ];

  return (
    <>
      {/* Navigation Rail */}
      <div className="nav-rail bg-white/95 backdrop-blur-xl border-r border-gray-200 fixed left-0 top-0 h-full z-40 flex flex-col shadow-sm">
        {/* Logo Section */}
        <div className="flex items-center justify-center lg:justify-start p-4 border-b border-gray-200 mb-8 lg:mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="nav-text ml-3">
            <h2 className="font-bold text-gray-900 text-lg">PlumberAgent</h2>
            <p className="text-xs text-gray-500">{t.aiAssistant}</p>
          </div>
        </div>

        {/* AI Assistant Section (Desktop Only) */}
        <div className="nav-text px-4 mb-4">
          <div className="w-full p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <button 
              onClick={onChatOpen}
              className="w-full p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t.speakWithAgent}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item flex items-center gap-2 px-3 py-2 lg:py-3 rounded-lg min-h-[52px] lg:min-h-[50px] relative mb-1 ${
                  item.active
                    ? 'bg-green-100 text-green-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="nav-text font-medium">{item.label}</span>
                {item.badge && (
                  <div className="mobile-badge absolute -top-1 -right-1 lg:relative lg:top-0 lg:right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-[20px] flex items-center justify-center">
                    <span>{item.badge}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section - Bottom for both mobile and desktop */}
        <div className="px-4 mb-4 mt-auto">
          {/* Mobile Profile */}
          <button className="lg:hidden w-full flex flex-col items-center py-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-colors">
              <span className="text-white font-semibold text-lg">{currentUser.initials}</span>
            </div>
          </button>

          {/* Desktop Profile */}
          <button className="hidden lg:flex w-full items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{currentUser.initials}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 text-sm">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{t.currentProfile}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Chat Bubble */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={onChatOpen}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* CSS for exact styling match */}
      <style jsx global>{`
        .nav-rail {
          width: 90px;
          transition: width 0.3s ease;
          overflow-y: auto;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          background: white;
          border-right: 1px solid #e5e7eb;
          z-index: 30;
        }

        .nav-text {
          display: none;
        }

        @media (min-width: 1024px) {
          .nav-rail {
            width: 280px;
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
          }
          
          .nav-rail::-webkit-scrollbar {
            width: 6px;
          }
          
          .nav-rail::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .nav-rail::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          
          .nav-rail::-webkit-scrollbar-thumb:hover {
            background-color: rgba(156, 163, 175, 0.7);
          }
          
          .nav-text {
            display: block;
          }
        }

        @media (max-width: 1023px) {
          .nav-rail {
            scrollbar-width: none;
            -ms-overflow-style: none;
            overflow: hidden;
            width: 90px;
            justify-content: center;
            overflow: visible;
            padding: 0;
          }
          
          .nav-rail > nav {
            padding: 0;
          }
          
          .nav-rail::-webkit-scrollbar {
            display: none;
          }
          
          .nav-rail nav {
            overflow: hidden;
            flex: none;
            max-height: calc(100vh - 200px);
          }
          
          .nav-item {
            justify-content: center;
            height: 52px;
            padding: 12px 0;
            margin: 4px 0;
            position: relative;
            overflow: visible;
          }
          
          .nav-item i {
            width: 24px !important;
            height: 24px !important;
          }
          
          .mobile-badge {
            font-size: 10px;
            font-weight: 600;
          }
          
          .nav-rail .mb-4 {
            margin-bottom: 8px;
          }
          
          .nav-rail .mb-8 {
            margin-bottom: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default NavigationRail;