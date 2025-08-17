"use client";

import React, { useState, useEffect } from 'react';
import NavigationRail from './NavigationRail';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentUser?: {
    name: string;
    initials: string;
  };
  jobsCount?: number;
  onChatOpen?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentUser = { name: 'Jan de Reparateur', initials: 'J' },
  jobsCount = 0,
  onChatOpen = () => console.log('Chat opened')
}) => {
  const [language, setLanguage] = useState<'nl' | 'en'>('nl');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('plumber_language');
    if (savedLang === 'en' || savedLang === 'nl') {
      setLanguage(savedLang);
    }
  }, []);

  // Save language preference to localStorage when changed
  const handleLanguageChange = (lang: 'nl' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('plumber_language', lang);
  };

  return (
    <>
      {/* Navigation Rail */}
      <NavigationRail
        currentUser={currentUser}
        jobsCount={jobsCount}
        language={language}
        onLanguageChange={handleLanguageChange}
        onChatOpen={onChatOpen}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Pass language and handler to children via context or props */}
        {React.cloneElement(children as React.ReactElement, {
          language,
          onLanguageChange: handleLanguageChange
        })}
      </main>

      {/* Global CSS for layout */}
      <style jsx global>{`
        .main-content {
          margin-left: 90px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          background-color: #f9fafb;
        }

        @media (min-width: 1024px) {
          .main-content {
            margin-left: 280px;
          }
        }
      `}</style>
    </>
  );
};

export default DashboardLayout;