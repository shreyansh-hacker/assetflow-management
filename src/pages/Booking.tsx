import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  AlertTriangle,
  Plus,
  Video,
  Laptop,
  Camera,
  Cpu,
  Monitor,
  Trash2,
  CalendarRange,
} from "lucide-react"

import { getBookings, createBooking, deleteBooking } from "@/services/bookings"
import { getEmployees, getDepartments } from "@/services/organization"
import type { ResourceBooking, ResourceType, BookingStatusType } from "@/types/bookings"
import { useToast } from "@/hooks/useToast"

// Reusable components
import PageHeader from "@/components/PageHeader"
import CalendarCard from "@/components/CalendarCard"

// UI primitives
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/Dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select"

// Zod validation for Booking Form
const bookingFormSchema = z.object({
  resourceName: z.string().min(1, "Please select a resource"),
  resourceType: z.string().min(1, "Resource type is required"),
  bookedBy: z.string().min(1, "Please specify who is booking"),
  date: z.string().min(1, "Booking date is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must match HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must match HH:MM format"),
  purpose: z.string().min(5, "Purpose description must be at least 5 characters"),
  department: z.string().min(1, "Please select a department"),
  notes: z.string().optional(),
}).refine((data) => {
  const start = parseInt(data.startTime.replace(":", ""))
  const end = parseInt(data.endTime.replace(":", ""))
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
})

export default function Booking() {
  const { toast } = useToast()

  // Local State representing bookings database in real-time
  const [bookings, setBookings] = useState<ResourceBooking[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-12") // Default calendar selected date
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // Conflicts state
  const [activeConflict, setActiveConflict] = useState<ResourceBooking | null>(null)

  // API Queries
  const { data: initialBookings = [] } = useQuery({
    queryKey: ["bookingsData"],
    queryFn: getBookings,
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["empsData"],
    queryFn: getEmployees,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["deptsData"],
    queryFn: getDepartments,
  })

  useEffect(() => {
    if (initialBookings.length > 0) {
      setBookings(initialBookings)
    }
  }, [initialBookings])

  // Form Hook
  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      resourceName: "",
      resourceType: "Meeting Rooms",
      bookedBy: "",
      date: "2026-07-12",
      startTime: "",
      endTime: "",
      purpose: "",
      department: "",
      notes: "",
    },
  })

  // Watch inputs dynamically for conflict detection
  const watchedResource = form.watch("resourceName")
  const watchedDate = form.watch("date")
  const watchedStart = form.watch("startTime")
  const watchedEnd = form.watch("endTime")

  useEffect(() => {
    if (watchedResource && watchedDate && watchedStart && watchedEnd) {
      // Run collision checks: overlaps if startA < endB and endA > startB
      const candidateStart = parseInt(watchedStart.replace(":", ""))
      const candidateEnd = parseInt(watchedEnd.replace(":", ""))

      const conflict = bookings.find((b) => {
        if (
          b.resourceName === watchedResource &&
          b.date === watchedDate &&
          b.status !== "cancelled"
        ) {
          const bStart = parseInt(b.startTime.replace(":", ""))
          const bEnd = parseInt(b.endTime.replace(":", ""))
          return candidateStart < bEnd && candidateEnd > bStart
        }
        return false
      })

      setActiveConflict(conflict || null)
    } else {
      setActiveConflict(null)
    }
  }, [watchedResource, watchedDate, watchedStart, watchedEnd, bookings])

  // Submit Handler
  const onSubmitBooking = async (values: z.infer<typeof bookingFormSchema>) => {
    if (activeConflict) {
      toast({
        title: "Booking Conflict",
        description: "Please resolve the timeline overlap warning before submitting.",
        type: "error",
      })
      return
    }

    try {
      const draft = {
        resourceName: values.resourceName,
        resourceType: values.resourceType as ResourceType,
        bookedBy: values.bookedBy,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        purpose: values.purpose,
        department: values.department,
        notes: values.notes,
      }

      const newBooking = await createBooking(draft)
      setBookings((prev) => [newBooking, ...prev])
      setIsBookingOpen(false)
      form.reset()
      toast({
        title: "Resource Booked",
        description: `Successfully reserved ${values.resourceName} for ${values.bookedBy}.`,
        type: "success",
      })
    } catch {
      toast({
        title: "Booking Failed",
        description: "Could not create the reservation.",
        type: "error",
      })
    }
  }

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    await deleteBooking(bookingId)
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as BookingStatusType } : b))
    )
    toast({
      title: "Booking Cancelled",
      description: `Reservation ${bookingId} was marked as Cancelled.`,
      type: "info",
    })
  }

  // Resource Icon selector
  const getResourceIcon = (type: ResourceType) => {
    if (type === "Meeting Rooms") return <Monitor className="w-4 h-4" />
    if (type === "Projectors") return <Video className="w-4 h-4" />
    if (type === "Laptops") return <Laptop className="w-4 h-4" />
    if (type === "Cameras") return <Camera className="w-4 h-4" />
    return <Cpu className="w-4 h-4" />
  }

  // Filter Bookings for Selected Date
  const filteredBookings = bookings.filter((b) => b.date === selectedDate)

  // Upcoming Bookings list
  const upcomingBookings = bookings
    .filter((b) => b.date > selectedDate && b.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  // Define resource list options
  const resourcesList = [
    { type: "Meeting Rooms", name: "Conference Room Alpha" },
    { type: "Meeting Rooms", name: "Huddle Room Beta" },
    { type: "Meeting Rooms", name: "Boardroom Premium" },
    { type: "Projectors", name: "Epson 4K Projector Pro" },
    { type: "Projectors", name: "BenQ Wireless Projector" },
    { type: "Laptops", name: "MacBook Pro Dev Kit #12" },
    { type: "Laptops", name: "Dell Latitude Test Rig" },
    { type: "Cameras", name: "Sony A7R V Camera Kit" },
    { type: "Cameras", name: "DJI Ronin Gimbal Kit" },
    { type: "Testing Devices", name: "Mobile Device Testing Kit #3" },
    { type: "Testing Devices", name: "VR Headset HTC Vive" },
  ]

  // Count available resources today
  const getAvailableCount = (type: ResourceType) => {
    const total = resourcesList.filter((r) => r.type === type).length
    const booked = bookings.filter((b) => b.resourceType === type && b.date === selectedDate && b.status !== "cancelled").length
    return Math.max(0, total - booked)
  }

  return (
    <div className="space-y-6 text-left select-none">
      {/* Title */}
      <PageHeader
        title="Resource Booking Calendar"
        description="Reserve conference rooms, test kits, cameras, and sandbox devices"
        actions={
          <Button size="sm" onClick={() => setIsBookingOpen(true)} className="shadow-premium gap-1.5 text-xs">
            <Plus className="w-4.5 h-4.5" />
            <span>Book Resource</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Calendar & Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Month Calendar Widget */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>Reserve Calendar</span>
              </span>
              <Badge variant="outline">Selected Date: {selectedDate}</Badge>
            </div>

            <CalendarCard />

            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pt-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <button onClick={() => setSelectedDate("2026-07-12")} className={`px-2.5 py-1.5 border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer text-center ${selectedDate === "2026-07-12" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>
                Jul 12 (Today)
              </button>
              <button onClick={() => setSelectedDate("2026-07-13")} className={`px-2.5 py-1.5 border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer text-center ${selectedDate === "2026-07-13" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>
                Jul 13 (Mon)
              </button>
              <button onClick={() => setSelectedDate("2026-07-14")} className={`px-2.5 py-1.5 border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer text-center ${selectedDate === "2026-07-14" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>
                Jul 14 (Tue)
              </button>
            </div>
          </div>

          {/* Selected Date Bookings list */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
              Bookings for {selectedDate === "2026-07-12" ? "Today" : selectedDate}
            </h3>

            {filteredBookings.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border bg-card text-center text-muted-foreground text-xs">
                No active bookings reserved for this date.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className={`p-4 rounded-xl border bg-card shadow-premium space-y-3 transition-all relative ${
                      bk.status === "cancelled" ? "opacity-50 border-border" : "border-border hover:shadow-md"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {getResourceIcon(bk.resourceType)}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-foreground text-sm block leading-tight truncate">
                          {bk.resourceName}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {bk.resourceType}
                        </span>
                      </div>
                    </div>

                    {/* Booking metadata */}
                    <div className="space-y-1.5 text-xs border-t border-border/50 pt-2.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{bk.startTime} - {bk.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span>{bk.bookedBy} ({bk.department})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-medium text-[10px]">Purpose:</span>
                        <span className="truncate italic">"{bk.purpose}"</span>
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={bk.status === "confirmed" ? "success" : "outline"}>
                        {bk.status}
                      </Badge>
                      {bk.status === "confirmed" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleCancelBooking(bk.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column Available Pools & Upcoming list */}
        <div className="space-y-6">
          {/* Resource Pools Availability */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground">
              Availability Today
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border">
                <span className="font-medium">Meeting Rooms</span>
                <Badge variant="success">{getAvailableCount("Meeting Rooms")} Free</Badge>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border">
                <span className="font-medium">Projectors</span>
                <Badge variant="success">{getAvailableCount("Projectors")} Free</Badge>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border">
                <span className="font-medium">Laptops</span>
                <Badge variant="success">{getAvailableCount("Laptops")} Free</Badge>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border">
                <span className="font-medium">Cameras</span>
                <Badge variant="success">{getAvailableCount("Cameras")} Free</Badge>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border">
                <span className="font-medium">Testing Devices</span>
                <Badge variant="success">{getAvailableCount("Testing Devices")} Free</Badge>
              </div>
            </div>
          </div>

          {/* Upcoming bookings list */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-premium space-y-4">
            <h3 className="font-semibold text-sm text-foreground tracking-tight uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <CalendarRange className="w-4 h-4 text-primary" />
              <span>Upcoming Bookings</span>
            </h3>

            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No future bookings scheduled.
              </p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                {upcomingBookings.map((bk) => (
                  <div key={bk.id} className="p-3 bg-muted/10 border border-border rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate max-w-[150px]">{bk.resourceName}</span>
                      <Badge variant="outline" className="font-mono text-[9px]">{bk.date}</Badge>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[10px]">
                      <span>{bk.startTime} - {bk.endTime}</span>
                      <span>By: {bk.bookedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md select-none text-left">
          <DialogHeader>
            <DialogTitle>Book Shared Resource</DialogTitle>
          </DialogHeader>

          {/* Conflict Overlap Warning Card */}
          {activeConflict && (
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 flex gap-2.5 items-start text-xs text-red-600 dark:text-red-400 animate-pulse shadow-md">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Booking Conflict Detected!</span>
                <p className="leading-relaxed mt-0.5">
                  "{activeConflict.resourceName}" is already reserved by {activeConflict.bookedBy} ({activeConflict.department}) on this date from {activeConflict.startTime} to {activeConflict.endTime}.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmitBooking)} className="space-y-4 pt-2">
            {/* Resource Type & Name Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Resource Type</label>
                <Controller
                  name="resourceType"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Resource Type" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        <SelectItem value="Meeting Rooms">Meeting Rooms</SelectItem>
                        <SelectItem value="Projectors">Projectors</SelectItem>
                        <SelectItem value="Laptops">Laptops</SelectItem>
                        <SelectItem value="Cameras">Cameras</SelectItem>
                        <SelectItem value="Testing Devices">Testing Devices</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Select Resource</label>
                <Controller
                  name="resourceName"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Select Device / Room" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {resourcesList
                          .filter((r) => r.type === form.watch("resourceType"))
                          .map((r, rIdx) => (
                            <SelectItem key={rIdx} value={r.name}>
                              {r.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.resourceName && (
                  <p className="text-xs text-destructive font-medium tracking-wide">
                    {form.formState.errors.resourceName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date, Start time, End time */}
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Date"
                type="date"
                error={form.formState.errors.date?.message}
                {...form.register("date")}
              />
              <Input
                label="Start Time"
                type="time"
                error={form.formState.errors.startTime?.message}
                {...form.register("startTime")}
              />
              <Input
                label="End Time"
                type="time"
                error={form.formState.errors.endTime?.message}
                {...form.register("endTime")}
              />
            </div>

            {/* Booked By & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Booked By</label>
                <Controller
                  name="bookedBy"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.name}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.bookedBy && (
                  <p className="text-xs text-destructive font-medium tracking-wide">
                    {form.formState.errors.bookedBy.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-foreground/80">Department</label>
                <Controller
                  name="department"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Select Dept" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.department && (
                  <p className="text-xs text-destructive font-medium tracking-wide">
                    {form.formState.errors.department.message}
                  </p>
                )}
              </div>
            </div>

            <Input
              label="Purpose / Agenda"
              placeholder="e.g. Design review presentation sync"
              error={form.formState.errors.purpose?.message}
              {...form.register("purpose")}
            />

            <Input
              label="Notes (Optional)"
              placeholder="HDMI adapters, dongles, remote access details"
              {...form.register("notes")}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={activeConflict !== null}>
                Submit Reservation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
