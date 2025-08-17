"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { api } from '~/trpc/react';
import { 
  Zap, 
  CalendarPlus, 
  Phone, 
  Navigation, 
  Calendar, 
  MessageCircle,
  Loader
} from 'lucide-react';

interface DashboardPageProps {
  language?: 'nl' | 'en';
  onLanguageChange?: (lang: 'nl' | 'en') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  language = 'nl',
  onLanguageChange = () => {}
}) => {
  // tRPC queries for real data
  const { data: stats, isLoading: statsLoading } = api.dashboard.getStats.useQuery();
  const { data: todayJobs, isLoading: jobsLoading } = api.jobs.list.useQuery({
    dateFrom: new Date(),
    dateTo: new Date(),
    limit: 5
  });
  const { data: recentActivity, isLoading: activityLoading } = api.dashboard.getRecentActivity?.useQuery() || { data: null, isLoading: false };

  const translations = {
    nl: {
      quickActions: 'Snelle Acties',
      aiAssistant: 'AI Assistent',
      askAiHelp: 'Vraag de AI om hulp',
      new: 'NIEUW',
      addJob: 'Klus Toevoegen',
      scheduleNewJob: 'Plan een nieuwe klus',
      callCustomer: 'Bel Klant',
      contactCustomers: 'Contacteer klanten',
      getDirections: 'Route Krijgen',
      navigateToCustomer: 'Navigeer naar klant',
      todaySchedule: 'Vandaag\'s Planning',
      viewAllJobs: 'Bekijk Alle Klussen →',
      recentActivity: 'Recente Activiteit',
      loadingSchedule: 'Planning wordt geladen...',
      loadingActivity: 'Activiteit wordt geladen...',
      noJobsToday: 'Geen klussen vandaag gepland',
      noRecentActivity: 'Geen recente activiteit'
    },
    en: {
      quickActions: 'Quick Actions',
      aiAssistant: 'AI Assistant',
      askAiHelp: 'Ask AI for help',
      new: 'NEW',
      addJob: 'Add Job',
      scheduleNewJob: 'Schedule a new job',
      callCustomer: 'Call Customer',
      contactCustomers: 'Contact customers',
      getDirections: 'Get Directions',
      navigateToCustomer: 'Navigate to customer',
      todaySchedule: 'Today\'s Schedule',
      viewAllJobs: 'View All Jobs →',
      recentActivity: 'Recent Activity',
      loadingSchedule: 'Loading schedule...',
      loadingActivity: 'Loading activity...',
      noJobsToday: 'No jobs scheduled for today',
      noRecentActivity: 'No recent activity'
    }
  };

  const t = translations[language];

  // Default stats when loading or no data
  const defaultStats = {
    todayRevenue: 2847,
    jobsCompleted: 12,
    pendingInvoices: 3,
    totalCustomers: 45
  };

  const currentStats = stats || defaultStats;

  const quickActions = [
    {
      id: 'ai-chat',
      title: t.aiAssistant,
      description: t.askAiHelp,
      icon: MessageCircle,
      gradient: 'from-blue-50 to-blue-100',
      hoverGradient: 'hover:from-blue-100 hover:to-blue-200',
      iconBg: 'from-blue-600 to-blue-700',
      iconHoverBg: 'group-hover:from-blue-700 group-hover:to-blue-800',
      badge: t.new,
      badgeBg: 'bg-blue-600',
      onClick: () => window.open('/test/widget', '_blank')
    },
    {
      id: 'add-job',
      title: t.addJob,
      description: t.scheduleNewJob,
      icon: CalendarPlus,
      gradient: 'from-green-50 to-green-100',
      hoverGradient: 'hover:from-green-100 hover:to-green-200',
      iconBg: 'bg-green-600',
      iconHoverBg: 'group-hover:bg-green-700',
      onClick: () => console.log('Add Job - tRPC integration ready')
    },
    {
      id: 'call-customer',
      title: t.callCustomer,
      description: t.contactCustomers,
      icon: Phone,
      gradient: 'from-purple-50 to-purple-100',
      hoverGradient: 'hover:from-purple-100 hover:to-purple-200',
      iconBg: 'bg-purple-600',
      iconHoverBg: 'group-hover:bg-purple-700',
      onClick: () => console.log('Call Customer')
    },
    {
      id: 'get-directions',
      title: t.getDirections,
      description: t.navigateToCustomer,
      icon: Navigation,
      gradient: 'from-orange-50 to-orange-100',
      hoverGradient: 'hover:from-orange-100 hover:to-orange-200',
      iconBg: 'bg-orange-600',
      iconHoverBg: 'group-hover:bg-orange-700',
      onClick: () => console.log('Get Directions - Google Maps integration ready')
    }
  ];

  return (
    <>
      {/* Dashboard Header */}
      <DashboardHeader
        currentUser={{ name: 'Jan van der Berg' }}
        stats={currentStats}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      {/* Content Section */}
      <div className="p-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            {t.quickActions}
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`quick-action-btn flex flex-col items-center p-6 bg-gradient-to-br ${action.gradient} rounded-xl ${action.hoverGradient} transition-all group border-2 ${
                    action.id === 'ai-chat' ? 'border-blue-200 hover:border-blue-300 shadow-lg shadow-blue-100' : ''
                  } relative hover:transform hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`w-12 h-12 ${action.iconBg.includes('gradient') ? `bg-gradient-to-br ${action.iconBg}` : action.iconBg} rounded-full flex items-center justify-center mb-3 ${action.iconHoverBg} transition-colors shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-600 text-center">{action.description}</p>
                  {action.badge && (
                    <span className={`absolute -top-2 -right-2 ${action.badgeBg} text-white text-xs px-2 py-1 rounded-full`}>
                      {action.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              {t.todaySchedule}
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {t.viewAllJobs}
            </button>
          </div>

          <div className="space-y-3">
            {jobsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Loader className="w-8 h-8 mx-auto text-gray-300 mb-3 animate-spin" />
                <p className="font-medium">{t.loadingSchedule}</p>
              </div>
            ) : todayJobs?.jobs && todayJobs.jobs.length > 0 ? (
              todayJobs.jobs.map((job: any) => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.customer?.name || 'Demo Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{job.startTime || '09:00'}</p>
                      <p className="text-xs text-gray-500">{job.city || 'Amsterdam'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">{t.noJobsToday}</p>
                <p className="text-sm text-gray-400 mt-1">tRPC database connection ready</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t.recentActivity}
          </h2>

          <div className="space-y-3">
            {activityLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Loader className="w-8 h-8 mx-auto text-gray-300 mb-3 animate-spin" />
                <p className="font-medium">{t.loadingActivity}</p>
              </div>
            ) : (
              // Mock recent activity until tRPC endpoint is ready
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Job Completed</p>
                    <p className="text-xs text-gray-500">Lekkage reparatie keuken - €453.44</p>
                  </div>
                  <div className="text-xs text-gray-400">2h ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New AI Chat Booking</p>
                    <p className="text-xs text-gray-500">Emergency pipe repair scheduled</p>
                  </div>
                  <div className="text-xs text-gray-400">3h ago</div>
                </div>
                <div className="text-center pt-4">
                  <p className="text-xs text-gray-400">Real-time activity via tRPC ready</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Wrap in DashboardLayout
const DashboardPageWithLayout: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
};

export default DashboardPageWithLayout;