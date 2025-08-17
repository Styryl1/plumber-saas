"use client";

import React from 'react';
import { Euro, Wrench, Phone, Users } from 'lucide-react';

interface DashboardStats {
  todayRevenue: number;
  jobsCompleted: number;
  pendingInvoices: number;
  totalCustomers: number;
}

interface DashboardHeaderProps {
  currentUser?: {
    name: string;
  };
  stats: DashboardStats;
  language: 'nl' | 'en';
  onLanguageChange: (lang: 'nl' | 'en') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser = { name: 'Jan' },
  stats,
  language,
  onLanguageChange
}) => {
  const translations = {
    nl: {
      welcome: 'Goedemorgen',
      subtitle: 'Hier is wat er vandaag gebeurt met je bedrijf',
      todayRevenue: "Vandaag's Omzet",
      jobsCompleted: 'Klussen Voltooid',
      pendingInvoices: 'Openstaande Facturen',
      totalCustomers: 'Totaal Klanten'
    },
    en: {
      welcome: 'Good morning',
      subtitle: "Here's what's happening with your business today",
      todayRevenue: "Today's Revenue",
      jobsCompleted: 'Jobs Completed',
      pendingInvoices: 'Pending Invoices',
      totalCustomers: 'Total Customers'
    }
  };

  const t = translations[language];

  // Get appropriate greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'nl') {
      if (hour < 12) return 'Goedemorgen';
      if (hour < 18) return 'Goedemiddag';
      return 'Goedenavond';
    } else {
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statsCards = [
    {
      icon: Euro,
      value: formatCurrency(stats.todayRevenue),
      label: t.todayRevenue
    },
    {
      icon: Wrench,
      value: stats.jobsCompleted.toString(),
      label: t.jobsCompleted
    },
    {
      icon: Phone,
      value: stats.pendingInvoices.toString(),
      label: t.pendingInvoices
    },
    {
      icon: Users,
      value: stats.totalCustomers.toString(),
      label: t.totalCustomers
    }
  ];

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {getGreeting()}, {currentUser.name}! 👋
          </h1>
          <p className="text-green-100">
            {t.subtitle}
          </p>
        </div>
        
        {/* Language Toggle */}
        <div className="language-toggle">
          <label 
            className={`lang-btn nl ${language === 'nl' ? 'active' : ''}`}
            onClick={() => onLanguageChange('nl')}
            style={{
              padding: '4px 12px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: language === 'nl' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              background: language === 'nl' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
          >
            NL
          </label>
          <label 
            className={`lang-btn en ${language === 'en' ? 'active' : ''}`}
            onClick={() => onLanguageChange('en')}
            style={{
              padding: '4px 12px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: language === 'en' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              background: language === 'en' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
          >
            EN
          </label>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl lg:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-100">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline CSS for exact styling match */}
      <style jsx>{`
        .language-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 4px;
        }
      `}</style>
    </div>
  );
};

export default DashboardHeader;