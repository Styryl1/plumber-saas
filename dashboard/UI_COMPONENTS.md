# UI Components - Schedule-X Calendar & shadcn/ui Integration

## Overview
Complete UI component library for plumbing dashboard with Schedule-X calendar integration, shadcn/ui components, and professional green theme (#059669) optimized for mobile plumber workflows.

## Schedule-X Calendar Integration

### Calendar Component Architecture
```typescript
// src/components/ui/calendar.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createCalendar } from '@schedule-x/calendar'
import { createViewDay, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import './calendar-overrides.css'

interface JobsCalendarProps {
  jobs: Job[]
  onJobUpdate: (jobId: string, updates: Partial<Job>) => void
  onJobCreate: (job: Omit<Job, 'id'>) => void
  onJobDelete: (jobId: string) => void
  view?: 'day' | 'week' | 'month'
  locale?: 'nl' | 'en'
}

export function JobsCalendar({
  jobs,
  onJobUpdate,
  onJobCreate,
  onJobDelete,
  view = 'week',
  locale = 'nl'
}: JobsCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendar, setCalendar] = useState<any>(null)

  useEffect(() => {
    if (!calendarRef.current) return

    const cal = createCalendar({
      locale: locale,
      selectedDate: new Date().toISOString().slice(0, 10),
      views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid()
      ],
      defaultView: view,
      events: transformJobsToEvents(jobs),
      plugins: [
        createDragAndDropPlugin(),
        createEventModalPlugin()
      ],
      theme: {
        colorScheme: 'light',
        colors: {
          primary: '#059669',      // Emerald-600
          onPrimary: '#ffffff',
          container: '#f8fafc',    // Slate-50
          onContainer: '#0f172a',  // Slate-900
          surface: '#ffffff',
          onSurface: '#334155',    // Slate-700
          outline: '#cbd5e1',      // Slash-300
          outlineVariant: '#e2e8f0', // Slate-200
          error: '#dc2626',        // Red-600
          onError: '#ffffff'
        }
      },
      callbacks: {
        onEventUpdate: (updatedEvent) => {
          const job = findJobById(updatedEvent.id)
          if (job) {
            onJobUpdate(job.id, {
              scheduledAt: new Date(updatedEvent.start),
              title: updatedEvent.title
            })
          }
        },
        onEventClick: (calendarEvent) => {
          const job = findJobById(calendarEvent.id)
          if (job) {
            openJobModal(job)
          }
        },
        onDateClick: (date) => {
          openCreateJobModal(new Date(date))
        }
      }
    })

    cal.render(calendarRef.current)
    setCalendar(cal)

    return () => {
      cal.destroy()
    }
  }, [])

  // Update calendar when jobs change
  useEffect(() => {
    if (calendar) {
      calendar.eventsService.set(transformJobsToEvents(jobs))
    }
  }, [jobs, calendar])

  const transformJobsToEvents = (jobs: Job[]) => {
    return jobs.map(job => ({
      id: job.id,
      title: `${job.title} - ${job.customer.name}`,
      start: job.scheduledAt.toISOString(),
      end: new Date(
        job.scheduledAt.getTime() + (job.estimatedDuration * 60000)
      ).toISOString(),
      calendarId: getCalendarIdByCategory(job.category),
      location: `${job.address}, ${job.city}`,
      people: job.employee ? [job.employee.firstName + ' ' + job.employee.lastName] : [],
      description: job.description || '',
      customFields: {
        priority: job.priority,
        status: job.status,
        customerPhone: job.customer.phone,
        estimatedCost: job.totalCost
      }
    }))
  }

  const getCalendarIdByCategory = (category: JobCategory) => {
    const categoryColors = {
      'EMERGENCY': 'emergency',      // Red
      'LEAK_REPAIR': 'urgent',       // Orange  
      'BOILER_SERVICE': 'maintenance', // Blue
      'INSTALLATION': 'installation', // Purple
      'MAINTENANCE': 'routine',       // Green
      'DRAIN_CLEANING': 'cleaning',   // Teal
      'OTHER': 'other'               // Gray
    }
    return categoryColors[category] || 'other'
  }

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarViewToggle 
            currentView={view}
            onViewChange={(newView) => calendar?.setView(newView)}
          />
          <CalendarDatePicker 
            date={calendar?.selectedDate}
            onDateChange={(date) => calendar?.setDate(date)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <JobFilters onFilterChange={handleFilterChange} />
          <CreateJobButton onClick={() => openCreateJobModal()} />
        </div>
      </div>

      {/* Legend */}
      <CalendarLegend />

      {/* Calendar */}
      <div 
        ref={calendarRef} 
        className="h-[600px] bg-white rounded-lg border border-slate-200 overflow-hidden"
      />
    </div>
  )
}

// Calendar view toggle component
function CalendarViewToggle({ currentView, onViewChange }: {
  currentView: string
  onViewChange: (view: string) => void
}) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {['day', 'week', 'month'].map((view) => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`px-3 py-1 text-sm rounded capitalize ${
            currentView === view
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  )
}

// Calendar date picker
function CalendarDatePicker({ date, onDateChange }: {
  date?: string
  onDateChange: (date: string) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
      >
        Today
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          onDateChange(yesterday.toISOString().slice(0, 10))
        }}
      >
        ←
      </Button>
      <span className="text-sm font-medium min-w-[120px] text-center">
        {date ? new Date(date).toLocaleDateString('nl-NL', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : ''}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          onDateChange(tomorrow.toISOString().slice(0, 10))
        }}
      >
        →
      </Button>
    </div>
  )
}
```

### Calendar Custom Styling
```css
/* src/components/ui/calendar-overrides.css */

/* Green theme override for Schedule-X */
.sx__calendar {
  --sx-color-primary: #059669;
  --sx-color-primary-container: #d1fae5;
  --sx-color-on-primary: #ffffff;
  --sx-color-surface: #ffffff;
  --sx-color-surface-variant: #f8fafc;
  --sx-color-outline: #cbd5e1;
  
  font-family: 'Inter', sans-serif;
}

/* Emergency jobs styling */
.sx__event[data-calendar-id="emergency"] {
  background-color: #dc2626 !important;
  border-color: #b91c1c !important;
  color: white !important;
}

/* Urgent jobs styling */
.sx__event[data-calendar-id="urgent"] {
  background-color: #ea580c !important;
  border-color: #c2410c !important;
  color: white !important;
}

/* Maintenance jobs styling */
.sx__event[data-calendar-id="maintenance"] {
  background-color: #059669 !important;
  border-color: #047857 !important;
  color: white !important;
}

/* Mobile responsive calendar */
@media (max-width: 768px) {
  .sx__calendar {
    font-size: 14px;
  }
  
  .sx__event {
    min-height: 32px;
    font-size: 12px;
    padding: 2px 4px;
  }
  
  .sx__time-grid-hour {
    font-size: 12px;
  }
  
  .sx__week-grid-day-header {
    font-size: 12px;
    padding: 4px;
  }
}

/* Touch-friendly interactions */
@media (hover: none) and (pointer: coarse) {
  .sx__event {
    min-height: 44px; /* iOS touch target minimum */
  }
  
  .sx__calendar-header button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## Dashboard Component Architecture

### Main Dashboard Layout
```typescript
// src/components/layout/DashboardLayout.tsx
'use client'

import { useState } from 'react'
import { NavigationRail } from './NavigationRail'
import { DashboardHeader } from './DashboardHeader'
import { useRealtimeUpdates } from '~/hooks/useRealtimeUpdates'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Enable real-time updates for this organization
  useRealtimeUpdates()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation sidebar */}
      <NavigationRail 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen} 
      />
      
      {/* Main content area */}
      <div className="lg:pl-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Navigation Rail Component
```typescript
// src/components/layout/NavigationRail.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '~/lib/utils'
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Home,
  Wrench,
  BarChart3,
  MessageSquare 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Calendar },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Materials', href: '/dashboard/materials', icon: Wrench },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Widget', href: '/dashboard/widget', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface NavigationRailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NavigationRail({ open, onOpenChange }: NavigationRailProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              PlumbingAgent
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={() => onOpenChange(false)}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3",
                  isActive ? "text-green-600" : "text-slate-500"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Jan de Vries
              </p>
              <p className="text-xs text-slate-500 truncate">
                Loodgietersbedrijf
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

### Dashboard Header Component
```typescript
// src/components/layout/DashboardHeader.tsx
'use client'

import { Menu, Bell, Search, Globe } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '~/components/ui/dropdown-menu'
import { Badge } from '~/components/ui/badge'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Global search */}
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Zoek klanten, jobs, facturen..."
                className="pl-10 w-64 lg:w-80"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Language toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                NL
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <span className="mr-2">🇳🇱</span>
                Nederlands
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇬🇧</span>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b border-slate-200">
                <h3 className="font-medium text-slate-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <NotificationItem
                  title="New emergency job"
                  description="Lekkage bij De Ruijterstraat 45"
                  time="2 min geleden"
                  urgent
                />
                <NotificationItem
                  title="Invoice paid"
                  description="Factuur INV-2024-0123 is betaald"
                  time="1 uur geleden"
                />
                <NotificationItem
                  title="Appointment reminder"
                  description="Job bij Bakkerstraat 12 om 14:00"
                  time="2 uur geleden"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({ 
  title, 
  description, 
  time, 
  urgent = false 
}: {
  title: string
  description: string
  time: string
  urgent?: boolean
}) {
  return (
    <div className={cn(
      "p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer",
      urgent && "bg-red-50 border-red-200"
    )}>
      <div className="flex items-start space-x-3">
        <div className={cn(
          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
          urgent ? "bg-red-500" : "bg-blue-500"
        )} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-sm text-slate-600 truncate">{description}</p>
          <p className="text-xs text-slate-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  )
}
```

## Data Display Components

### Job Cards Component
```typescript
// src/components/dashboard/JobCard.tsx
'use client'

import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { 
  MapPin, 
  Clock, 
  Phone, 
  User,
  AlertTriangle,
  CheckCircle,
  Circle,
  Play
} from 'lucide-react'
import { cn } from '~/lib/utils'
import type { Job } from '~/types'

interface JobCardProps {
  job: Job
  onStatusChange: (jobId: string, status: JobStatus) => void
  onEdit: (job: Job) => void
  compact?: boolean
}

export function JobCard({ job, onStatusChange, onEdit, compact = false }: JobCardProps) {
  const priorityColors = {
    'LOW': 'bg-slate-100 text-slate-700',
    'NORMAL': 'bg-blue-100 text-blue-700',
    'HIGH': 'bg-orange-100 text-orange-700',
    'EMERGENCY': 'bg-red-100 text-red-700'
  }

  const statusIcons = {
    'SCHEDULED': Circle,
    'IN_PROGRESS': Play,
    'COMPLETED': CheckCircle,
    'CANCELLED': Circle,
    'NO_SHOW': AlertTriangle
  }

  const StatusIcon = statusIcons[job.status]

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow cursor-pointer",
      job.priority === 'EMERGENCY' && "border-red-200 bg-red-50/50",
      compact && "p-3"
    )}>
      <CardHeader className={cn(
        "pb-3",
        compact && "p-0 pb-2"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-slate-900 truncate",
              compact ? "text-sm" : "text-base"
            )}>
              {job.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  priorityColors[job.priority]
                )}
              >
                {job.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {job.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-3">
            <StatusIcon className={cn(
              "w-4 h-4",
              job.status === 'COMPLETED' ? "text-green-600" :
              job.status === 'IN_PROGRESS' ? "text-blue-600" :
              job.status === 'CANCELLED' ? "text-red-600" :
              "text-slate-400"
            )} />
            {!compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(job)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(
        "space-y-3",
        compact && "p-0"
      )}>
        {/* Customer info */}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-600 truncate">
            {job.customer.name}
          </span>
          <a 
            href={`tel:${job.customer.phone}`}
            className="text-green-600 hover:text-green-700"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 truncate">{job.address}</p>
            <p className="text-xs text-slate-500">{job.postalCode} {job.city}</p>
          </div>
        </div>

        {/* Timing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {new Date(job.scheduledAt).toLocaleString('nl-NL', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              €{job.totalCost.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">
              {job.estimatedDuration}min
            </p>
          </div>
        </div>

        {/* Quick actions */}
        {!compact && job.status !== 'COMPLETED' && (
          <div className="flex space-x-2 pt-2 border-t border-slate-100">
            {job.status === 'SCHEDULED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(job.id, 'IN_PROGRESS')}
                className="flex-1"
              >
                Start Job
              </Button>
            )}
            {job.status === 'IN_PROGRESS' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(job.id, 'COMPLETED')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Stats Cards Component
```typescript
// src/components/dashboard/StatsCards.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { 
  Calendar,
  Users,
  Euro,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { cn } from '~/lib/utils'

interface Stat {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ComponentType<{ className?: string }>
  color?: 'green' | 'blue' | 'orange' | 'red'
}

interface StatsCardsProps {
  stats: Stat[]
  className?: string
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  )
}

function StatCard({ stat }: { stat: Stat }) {
  const colorClasses = {
    green: {
      icon: 'text-green-600 bg-green-100',
      trend: 'text-green-600'
    },
    blue: {
      icon: 'text-blue-600 bg-blue-100',
      trend: 'text-blue-600'
    },
    orange: {
      icon: 'text-orange-600 bg-orange-100',
      trend: 'text-orange-600'
    },
    red: {
      icon: 'text-red-600 bg-red-100',
      trend: 'text-red-600'
    }
  }

  const colors = colorClasses[stat.color || 'blue']

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">
              {stat.title}
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stat.value}
            </p>
            
            {stat.change && (
              <div className="flex items-center mt-2">
                <TrendingUp className={cn(
                  "w-4 h-4 mr-1",
                  stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600',
                  stat.change.type === 'decrease' && 'transform rotate-180'
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change.value > 0 ? '+' : ''}{stat.change.value}%
                </span>
                <span className="text-sm text-slate-500 ml-1">
                  vs last month
                </span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            colors.icon
          )}>
            <stat.icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Usage example
export function DashboardStats() {
  const stats: Stat[] = [
    {
      title: 'Jobs Today',
      value: 12,
      change: { value: 8, type: 'increase' },
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Active Customers',
      value: 248,
      change: { value: 12, type: 'increase' },
      icon: Users,
      color: 'green'
    },
    {
      title: 'Revenue This Month',
      value: '€12,450',
      change: { value: 15, type: 'increase' },
      icon: Euro,
      color: 'green'
    },
    {
      title: 'Emergency Jobs',
      value: 3,
      change: { value: 2, type: 'decrease' },
      icon: AlertTriangle,
      color: 'orange'
    }
  ]

  return <StatsCards stats={stats} />
}
```

This UI component library provides a complete, production-ready foundation for the plumbing dashboard with Schedule-X calendar integration, professional design system, and mobile-optimized components.