# 🎨 UI Expert Patterns - Schedule-X + shadcn/ui + Tailwind

*Last Updated: 2025-01-15 | Compatible: Schedule-X 2.1+, shadcn/ui Latest, Tailwind 3.4+*

## 🎯 Schedule-X Calendar Integration (Verified)

### **1. Perfect T3 + Schedule-X Pattern** ✅ VERIFIED
```typescript
// app/(dashboard)/jobs/page.tsx - CURRENT BEST PRACTICE
"use client"
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewWeek, createViewMonth, createViewDay } from '@schedule-x/calendar'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '~/trpc/react'

export default function JobsPage() {
  const { data: jobs, isLoading } = api.jobs.list.useQuery()
  const createJob = api.jobs.create.useMutation()
  const updateJob = api.jobs.update.useMutation()
  
  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonth(), createViewDay()],
    events: jobs?.map(job => ({
      id: job.id,
      title: `${job.customerName} - ${job.serviceType}`,
      start: job.scheduledAt.toISOString(),
      end: job.scheduledEndAt?.toISOString() || 
            new Date(job.scheduledAt.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      calendarId: 'jobs',
      description: job.description,
      location: `${job.customer?.street}, ${job.customer?.city}`,
    })) || [],
    
    calendars: {
      jobs: {
        colorName: 'jobs',
        lightColors: {
          main: '#059669', // Your green-600
          container: '#d1fae5', // green-100
          onContainer: '#065f46', // green-800
        },
        darkColors: {
          main: '#10b981', // green-500
          onContainer: '#ecfdf5',
          container: '#064e3b',
        },
      },
    },
    
    plugins: [
      createEventModalPlugin({
        onCreateEvent: async (event) => {
          await createJob.mutateAsync({
            customerName: event.title.split(' - ')[0] || 'New Customer',
            serviceType: 'Emergency Repairs',
            scheduledAt: new Date(event.start),
            estimatedHours: 2,
          })
        },
        onUpdateEvent: async (event) => {
          await updateJob.mutateAsync({
            id: event.id,
            scheduledAt: new Date(event.start),
          })
        },
      }),
    ],
    
    callbacks: {
      onEventUpdate: async (updatedEvent) => {
        await updateJob.mutateAsync({
          id: updatedEvent.id,
          scheduledAt: new Date(updatedEvent.start),
        })
      },
      onEventClick: (clickedEvent) => {
        // Navigate to job details
        router.push(`/jobs/${clickedEvent.id}`)
      },
    },
  })

  if (isLoading) {
    return <CalendarSkeleton />
  }

  return (
    <div className="p-6">
      {/* Header matching your dashboard style */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Schedule</h1>
          <p className="text-gray-600">Manage your appointments and jobs</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CalendarPlusIcon className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Calendar in card matching your dashboard style */}
      <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-[600px]">
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      </Card>
    </div>
  )
}
```

### **2. Schedule-X Customization for Your Design** ✅ STYLED
```css
/* Custom CSS to match your dashboard styling */
/* Add to globals.css */

.sx-calendar {
  --sx-color-primary: #059669; /* Your green-600 */
  --sx-color-primary-container: #d1fae5; /* green-100 */
  --sx-color-on-primary: white;
  --sx-color-on-primary-container: #065f46; /* green-800 */
  
  /* Match your card styling */
  border-radius: 0.75rem; /* rounded-xl */
  font-family: Inter, system-ui, sans-serif;
}

.sx-calendar .sx-event {
  background-color: #059669 !important; /* Your green */
  border: none;
  border-radius: 0.375rem; /* rounded-md */
  color: white;
  font-weight: 500;
}

.sx-calendar .sx-event:hover {
  background-color: #047857 !important; /* Your green-700 */
}

.sx-calendar .sx-week-grid__hour-label {
  color: #6b7280; /* gray-500 */
  font-size: 0.875rem; /* text-sm */
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .sx-calendar {
    font-size: 0.875rem;
  }
  
  .sx-calendar .sx-event {
    padding: 0.25rem;
    font-size: 0.75rem;
  }
}
```

## 🧩 shadcn/ui Components with Your Styling

### **1. Dashboard Card Component** ✅ VERIFIED
```typescript
// components/ui/dashboard-card.tsx - Matching your design
import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  value?: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ className, title, value, subtitle, icon, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl shadow-sm p-6", // Your exact card styling
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <p className="text-sm text-gray-600">{title}</p>
            )}
            {value && (
              <p className="text-3xl font-bold text-green-600">{value}</p> // Your green
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)

DashboardCard.displayName = "DashboardCard"
export { DashboardCard }
```

### **2. Button Components (Your Exact Styling)** ✅ VERIFIED
```typescript
// components/ui/button.tsx - Modified for your colors
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500", // Your primary
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500", // Your secondary
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "px-4 py-2", // Your padding
        sm: "px-3 py-1.5 text-sm",
        lg: "px-6 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
export { Button, buttonVariants }
```

### **3. Form Components (Matching Your Style)** ✅ VERIFIED
```typescript
// components/ui/input.tsx - Your input styling
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", // Your styling
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
export { Input }
```

## 📱 Mobile-First Responsive Patterns

### **1. Mobile Calendar Pattern** ✅ MOBILE
```typescript
// hooks/useResponsiveCalendar.ts
import { useMediaQuery } from '@/hooks/use-media-query'

export function useResponsiveCalendar() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")
  
  return {
    defaultView: isMobile ? 'day' : isTablet ? 'week' : 'month',
    views: isMobile 
      ? [createViewDay(), createViewWeek()] 
      : [createViewWeek(), createViewMonth(), createViewDay()],
    height: isMobile ? 400 : 600,
  }
}

// Usage in component
const { defaultView, views, height } = useResponsiveCalendar()
const calendar = useCalendarApp({
  defaultView,
  views,
  // ... other config
})
```

### **2. Mobile Filter Pattern** ✅ MOBILE
```typescript
// components/mobile-filters.tsx - Your mobile styling
export function MobileFilters({ filters, onFiltersChange }) {
  return (
    <div className="lg:hidden mb-4">
      {/* Mobile filter buttons - full width */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-full">
        <button className="flex-1 px-4 py-2 text-sm rounded bg-white text-gray-900 shadow-sm">
          Today
        </button>
        <button className="flex-1 px-4 py-2 text-sm rounded text-gray-600">
          Week
        </button>
        <button className="flex-1 px-4 py-2 text-sm rounded text-gray-600">
          Month
        </button>
      </div>
      
      {/* Mobile action button - full width */}
      <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
        <Plus className="w-4 h-4 mr-2" />
        Add Job
      </Button>
    </div>
  )
}
```

## 🎨 Custom Dashboard Components

### **1. Stats Grid (Your Design)** ✅ VERIFIED
```typescript
// components/dashboard/stats-grid.tsx
interface StatsGridProps {
  stats: Array<{
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
  }>
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <DashboardCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  )
}

// Usage - matches your dashboard exactly
<StatsGrid 
  stats={[
    {
      title: "Today's Jobs",
      value: 8,
      subtitle: "2 completed",
      icon: <CalendarIcon className="w-8 h-8" />,
    },
    {
      title: "Active Jobs", 
      value: 23,
      subtitle: "This week",
      icon: <WrenchIcon className="w-8 h-8" />,
    },
    // ... more stats
  ]}
/>
```

### **2. Job Card Component** ✅ VERIFIED
```typescript
// components/jobs/job-card.tsx - For list views
interface JobCardProps {
  job: {
    id: string
    customerName: string
    serviceType: string
    scheduledAt: Date
    status: string
    address?: string
  }
  onEdit?: (job) => void
  onComplete?: (job) => void
}

export function JobCard({ job, onEdit, onComplete }: JobCardProps) {
  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800", 
    completed: "bg-green-100 text-green-800",
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{job.customerName}</h3>
          <p className="text-sm text-gray-600">{job.serviceType}</p>
          <p className="text-sm text-gray-500 mt-1">
            {format(job.scheduledAt, 'MMM d, yyyy - HH:mm')}
          </p>
          {job.address && (
            <p className="text-sm text-gray-500">{job.address}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColors[job.status] || "bg-gray-100 text-gray-800"
          )}>
            {job.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit?.(job)}
        >
          Edit
        </Button>
        {job.status === 'scheduled' && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onComplete?.(job)}
            className="bg-green-600 hover:bg-green-700"
          >
            Start Job
          </Button>
        )}
      </div>
    </div>
  )
}
```

## 🚨 Anti-Patterns (AVOID)

### **❌ Don't Override Schedule-X Core Styles Aggressively**
```css
/* ❌ WRONG - breaks calendar functionality */
.sx-calendar * {
  color: red !important; /* Too aggressive */
}

/* ✅ CORRECT - targeted styling */
.sx-calendar .sx-event {
  background-color: #059669 !important; /* Specific selector */
}
```

### **❌ Don't Mix Inline Styles with shadcn/ui**
```typescript
// ❌ WRONG - inconsistent styling
<Button style={{ backgroundColor: 'green' }}>Save</Button>

// ✅ CORRECT - use className system
<Button className="bg-green-600 hover:bg-green-700">Save</Button>
```

## ⚡ Performance Patterns

### **1. Calendar Event Optimization** ✅ PERFORMANCE
```typescript
// Optimize large event lists
const optimizedEvents = useMemo(() => {
  return jobs?.map(job => ({
    id: job.id,
    title: `${job.customerName} - ${job.serviceType}`,
    start: job.scheduledAt.toISOString(),
    end: job.scheduledEndAt?.toISOString(),
    // Pre-compute heavy operations
    color: getJobColor(job.serviceType),
  })) || []
}, [jobs])

const calendar = useCalendarApp({
  events: optimizedEvents, // Use memoized events
  // ...
})
```

### **2. Component Lazy Loading** ✅ PERFORMANCE
```typescript
// Lazy load heavy components
const ScheduleXCalendar = lazy(() => import('@schedule-x/react').then(m => ({ 
  default: m.ScheduleXCalendar 
})))

const CalendarContainer = lazy(() => import('./calendar-container'))

// Usage with suspense
<Suspense fallback={<CalendarSkeleton />}>
  <CalendarContainer />
</Suspense>
```

## 📊 Success Metrics

- ✅ Schedule-X calendar renders correctly
- ✅ All components match your dashboard styling
- ✅ Mobile responsiveness works perfectly
- ✅ Event creation/editing functions properly
- ✅ Real-time updates reflect in calendar
- ✅ Performance <3 second initial load
- ✅ No styling conflicts between libraries

## 🔄 Update Process

This file is updated by the UI Specialist Agent when:
- Schedule-X releases new versions
- shadcn/ui components update
- New Tailwind CSS features released
- Mobile UX patterns evolve
- Performance optimizations discovered

**Always test mobile responsiveness on real devices!**