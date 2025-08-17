"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, Phone, User } from "lucide-react";

// Schedule-X Calendar types
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarId?: string;
  description?: string;
  location?: string;
  customData?: {
    jobId?: string;
    customerId?: string;
    bookingId?: string;
    priority?: string;
    status?: string;
    customerPhone?: string;
    serviceType?: string;
    estimatedCost?: number;
  };
}

interface BookingCalendarProps {
  organizationId: string;
  plumberId?: string;
  language?: "nl" | "en";
  onBookingClick?: (booking: any) => void;
  onJobClick?: (job: any) => void;
}

export function BookingCalendar({
  organizationId,
  plumberId,
  language = "nl",
  onBookingClick,
  onJobClick,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");
  const calendarRef = useRef<HTMLDivElement>(null);
  const scheduleXRef = useRef<any>(null);

  // Get jobs for calendar
  const { data: jobs } = api.jobs.list.useQuery({
    organizationId,
    plumberId,
    startDate: getWeekStart(selectedDate),
    endDate: getWeekEnd(selectedDate),
  });

  // Get bookings for calendar
  const { data: bookings } = api.chat.getRecentBookings.useQuery({
    organizationId,
    status: "all",
    limit: 100,
  });

  // Convert booking to job mutation
  const convertBookingMutation = api.chat.convertBookingToJob.useMutation({
    onSuccess: () => {
      // Refresh calendar data
      window.location.reload();
    },
  });

  // Initialize Schedule-X Calendar
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        // Dynamically import Schedule-X
        const { createCalendar } = await import('@schedule-x/calendar');
        const { createViewWeek } = await import('@schedule-x/calendar/views/week');
        const { createViewMonthGrid } = await import('@schedule-x/calendar/views/month-grid');
        const { createViewDay } = await import('@schedule-x/calendar/views/day');
        const { createEventsServicePlugin } = await import('@schedule-x/events-service');
        const { createDragAndDropPlugin } = await import('@schedule-x/drag-and-drop');

        if (!calendarRef.current) return;

        const calendar = createCalendar({
          selectedDate: selectedDate.toISOString().split('T')[0],
          defaultView: viewMode,
          views: [
            createViewMonthGrid(),
            createViewWeek(),
            createViewDay(),
          ],
          events: calendarEvents,
          plugins: [
            createEventsServicePlugin(),
            createDragAndDropPlugin(),
          ],
          callbacks: {
            onEventClick: (calendarEvent: CalendarEvent) => {
              setSelectedEvent(calendarEvent);
              setShowEventModal(true);
            },
            onDateClick: (date: string) => {
              setSelectedDate(new Date(date));
            },
          },
          locale: language,
        });

        calendar.render(calendarRef.current);
        scheduleXRef.current = calendar;

        return () => {
          if (scheduleXRef.current) {
            scheduleXRef.current.destroy();
          }
        };
      } catch (error) {
        console.error("Failed to load Schedule-X calendar:", error);
      }
    };

    initializeCalendar();
  }, [selectedDate, viewMode, language, calendarEvents]);

  // Convert jobs and bookings to calendar events
  useEffect(() => {
    const events: CalendarEvent[] = [];

    // Add scheduled jobs
    if (jobs) {
      jobs.forEach(job => {
        if (job.scheduledAt) {
          const startTime = new Date(job.scheduledAt);
          const endTime = new Date(startTime.getTime() + (job.duration || 60) * 60000);

          events.push({
            id: `job-${job.id}`,
            title: job.title,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            calendarId: 'jobs',
            description: job.description || undefined,
            location: job.address || undefined,
            customData: {
              jobId: job.id,
              customerId: job.customerId || undefined,
              priority: job.priority,
              status: job.status,
              serviceType: job.jobType,
            },
          });
        }
      });
    }

    // Add bookings that haven't been converted to jobs yet
    if (bookings) {
      bookings
        .filter(booking => booking.status === 'new' || booking.status === 'confirmed')
        .forEach(booking => {
          if (booking.preferredDate) {
            const preferredDate = new Date(booking.preferredDate);
            const startTime = getPreferredDateTime(preferredDate, booking.preferredTime);
            const endTime = new Date(startTime.getTime() + (booking.estimatedDuration || 60) * 60000);

            events.push({
              id: `booking-${booking.id}`,
              title: `${booking.serviceType} - ${booking.customerName}`,
              start: startTime.toISOString(),
              end: endTime.toISOString(),
              calendarId: 'bookings',
              description: booking.description || undefined,
              location: booking.address,
              customData: {
                bookingId: booking.id,
                priority: booking.urgency,
                status: booking.status,
                customerPhone: booking.customerPhone,
                serviceType: booking.serviceType,
                estimatedCost: booking.estimatedCost || undefined,
              },
            });
          }
        });
    }

    setCalendarEvents(events);
  }, [jobs, bookings]);

  const handleConvertBooking = async (bookingId: string) => {
    if (!plumberId) return;

    const booking = bookings?.find(b => b.id === bookingId);
    if (!booking || !booking.preferredDate) return;

    const scheduledAt = getPreferredDateTime(
      new Date(booking.preferredDate),
      booking.preferredTime
    );

    convertBookingMutation.mutate({
      bookingId,
      organizationId,
      plumberId,
      scheduledAt,
      estimatedDuration: booking.estimatedDuration || 60,
    });
  };

  const getStatusColor = (status: string, priority: string) => {
    if (priority === "emergency") return "bg-red-500 text-white";
    if (priority === "urgent") return "bg-orange-500 text-white";
    
    switch (status) {
      case "scheduled": return "bg-blue-500 text-white";
      case "in_progress": return "bg-yellow-500 text-white";
      case "completed": return "bg-green-500 text-white";
      case "new": return "bg-purple-500 text-white";
      case "confirmed": return "bg-indigo-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const text = {
    nl: {
      title: "Planning Kalender",
      month: "Maand",
      week: "Week",
      day: "Dag",
      today: "Vandaag",
      jobs: "Klussen",
      bookings: "Boekingen",
      eventDetails: "Afspraak Details",
      convertToJob: "Omzetten naar Klus",
      customer: "Klant",
      phone: "Telefoon",
      address: "Adres",
      time: "Tijd",
      duration: "Duur",
      status: "Status",
      priority: "Prioriteit",
      serviceType: "Service Type",
      estimatedCost: "Geschatte Kosten",
      description: "Beschrijving",
      close: "Sluiten",
      edit: "Bewerken",
      delete: "Verwijderen",
      minutes: "minuten",
    },
    en: {
      title: "Schedule Calendar",
      month: "Month",
      week: "Week",
      day: "Day",
      today: "Today",
      jobs: "Jobs",
      bookings: "Bookings",
      eventDetails: "Event Details",
      convertToJob: "Convert to Job",
      customer: "Customer",
      phone: "Phone",
      address: "Address",
      time: "Time",
      duration: "Duration",
      status: "Status",
      priority: "Priority",
      serviceType: "Service Type",
      estimatedCost: "Estimated Cost",
      description: "Description",
      close: "Close",
      edit: "Edit",
      delete: "Delete",
      minutes: "minutes",
    },
  };

  const t = text[language];

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {t.title}
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Buttons */}
            <div className="flex border rounded-lg overflow-hidden">
              {["month", "week", "day"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 text-sm ${
                    viewMode === mode
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t[mode as keyof typeof t] as string}
                </button>
              ))}
            </div>

            {/* Today Button */}
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
            >
              {t.today}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div ref={calendarRef} className="schedule-x-calendar" />

        {/* Fallback Calendar (if Schedule-X fails to load) */}
        <div className="grid grid-cols-7 gap-1 text-sm">
          {/* Calendar would be rendered here as fallback */}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1" />
            <span className="text-gray-600">{t.jobs}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-1" />
            <span className="text-gray-600">{t.bookings}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1" />
            <span className="text-gray-600">Emergency</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded mr-1" />
            <span className="text-gray-600">Urgent</span>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.eventDetails}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedEvent.title}</h4>
                <div className={`inline-block px-2 py-1 rounded text-xs ${
                  getStatusColor(
                    selectedEvent.customData?.status || "",
                    selectedEvent.customData?.priority || ""
                  )
                }`}>
                  {selectedEvent.customData?.status}
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span>
                    {new Date(selectedEvent.start).toLocaleString()} - {" "}
                    {new Date(selectedEvent.end).toLocaleString()}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.customData?.customerPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedEvent.customData.customerPhone}</span>
                  </div>
                )}

                {selectedEvent.customData?.serviceType && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedEvent.customData.serviceType}</span>
                  </div>
                )}

                {selectedEvent.customData?.estimatedCost && (
                  <div className="text-green-600 font-medium">
                    {t.estimatedCost}: €{selectedEvent.customData.estimatedCost}
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <span className="font-medium">{t.description}:</span>
                    <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {selectedEvent.customData?.bookingId && (
                  <button
                    onClick={() => handleConvertBooking(selectedEvent.customData!.bookingId!)}
                    disabled={convertBookingMutation.isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm disabled:opacity-50"
                  >
                    {convertBookingMutation.isLoading ? "..." : t.convertToJob}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (selectedEvent.customData?.jobId) {
                      onJobClick?.(selectedEvent.customData.jobId);
                    } else if (selectedEvent.customData?.bookingId) {
                      onBookingClick?.(selectedEvent.customData.bookingId);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  {t.edit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule-X Styles */}
      <style jsx global>{`
        .schedule-x-calendar {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .sx__calendar {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        
        .sx__event {
          border-radius: 0.25rem;
          font-size: 0.75rem;
          padding: 0.125rem 0.25rem;
        }
        
        .sx__event[data-calendar-id="jobs"] {
          background-color: #3b82f6;
          color: white;
        }
        
        .sx__event[data-calendar-id="bookings"] {
          background-color: #8b5cf6;
          color: white;
        }
        
        .sx__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .sx__today {
          background-color: #eff6ff;
        }
      `}</style>
    </div>
  );
}

// Helper functions
function getWeekStart(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekEnd(date: Date): Date {
  const end = new Date(getWeekStart(date));
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getPreferredDateTime(date: Date, timePreference?: string): Date {
  const result = new Date(date);
  
  switch (timePreference) {
    case "morning":
      result.setHours(9, 0, 0, 0);
      break;
    case "afternoon":
      result.setHours(14, 0, 0, 0);
      break;
    case "evening":
      result.setHours(18, 0, 0, 0);
      break;
    default:
      result.setHours(10, 0, 0, 0);
  }
  
  return result;
}