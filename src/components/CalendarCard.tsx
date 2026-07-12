import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/utils/cn"
import { useQuery } from "@tanstack/react-query"
import { getBookings } from "@/services/bookings"

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: "maintenance" | "audit" | "booking"
}

interface CalendarCardProps {
  className?: string
}

export default function CalendarCard({ className }: CalendarCardProps) {
  const { data: bookings = [] } = useQuery({
    queryKey: ["bookingsData"],
    queryFn: getBookings,
  })

  // Static mock events + live bookings scheduled for today (July 12, 2026)
  const events: CalendarEvent[] = [
    { id: "e1", title: "Quarterly Audit - IT Equipment", time: "10:00 AM", type: "audit" },
    { id: "e2", title: "Server Rack B fan replacement", time: "02:00 PM", type: "maintenance" },
    ...bookings
      .filter((b) => b.status === "confirmed" && b.date === "2026-07-12")
      .map((b) => ({
        id: b.id,
        title: `${b.resourceName} Reservation`,
        time: b.startTime,
        type: "booking" as const,
      })),
  ]

  // Calendar calculations
  const daysInMonth = 31 // July
  const firstDayIndex = 3 // July 1st, 2026 is Wednesday (index 3 if Sunday is 0)
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDaysBefore = Array.from({ length: firstDayIndex }, () => null)
  const allDays = [...emptyDaysBefore, ...daysArray]

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card shadow-premium select-none text-left flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm text-foreground">Calendar Overview</h4>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-1.5">July 2026</span>
          <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center gap-y-1">
        {allDays.map((day, idx) => {
          const isToday = day === 12
          const hasEvent = day === 12 // July 12 has active events
          return (
            <div key={idx} className="flex items-center justify-center p-0.5 relative">
              {day !== null ? (
                <button
                  className={cn(
                    "w-7 h-7 text-xs font-medium rounded-full flex items-center justify-center transition-colors cursor-pointer relative",
                    isToday
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {day}
                  {hasEvent && !isToday && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              ) : (
                <div className="w-7 h-7" />
              )}
            </div>
          )
        })}
      </div>

      {/* Events List */}
      <div className="space-y-2 mt-2">
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Today's Schedule</span>
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className={cn(
                "p-2.5 rounded-lg border flex flex-col gap-1 text-xs transition-all hover:bg-muted/10",
                event.type === "audit" && "border-sky-500/20 bg-sky-500/5",
                event.type === "maintenance" && "border-amber-500/20 bg-amber-500/5",
                event.type === "booking" && "border-primary/20 bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-foreground truncate">{event.title}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded border font-semibold",
                  event.type === "audit" && "text-sky-600 bg-sky-500/10 border-sky-500/10",
                  event.type === "maintenance" && "text-amber-600 bg-amber-500/10 border-amber-500/10",
                  event.type === "booking" && "text-primary bg-primary/10 border-primary/10"
                )}>
                  {event.type}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{event.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
