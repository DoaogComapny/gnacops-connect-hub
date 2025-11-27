import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Calendar as CalendarIcon,
  Video,
  MapPin,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BookedSlot {
  time: string;
  endTime: string;
}

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [appointmentType, setAppointmentType] = useState<"in-person" | "virtual">("in-person");
  const [duration, setDuration] = useState("30");
  const [timeSlot, setTimeSlot] = useState("");
  const [purpose, setPurpose] = useState("");
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  // Fetch available dates and unavailable dates from the database
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Fetch booked slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    } else {
      setBookedSlots([]);
      setTimeSlot("");
    }
  }, [selectedDate]);

  const fetchAvailableDates = async () => {
    setIsLoadingDates(true);
    try {
      const { data: availData, error: availError } = await supabase
        .from("available_dates")
        .select("date, is_available")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (availError) {
        console.error("Error fetching available dates:", availError);
        // Don't show error - allow booking on any date if table is empty
      }

      if (availData) {
        const available: Date[] = [];
        const unavailable: Date[] = [];

        availData.forEach((item) => {
          const date = new Date(item.date + "T00:00:00");
          if (item.is_available) {
            available.push(date);
          } else {
            unavailable.push(date);
          }
        });

        setAvailableDates(available);
        setUnavailableDates(unavailable);
      }
    } catch (error: any) {
      console.error("Error:", error);
      // Don't block the user - allow booking on any date
    } finally {
      setIsLoadingDates(false);
    }
  };

  const fetchBookedSlots = async (date: Date) => {
    setIsLoadingSlots(true);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date, duration_minutes, status")
        .gte("appointment_date", startOfDay.toISOString())
        .lte("appointment_date", endOfDay.toISOString())
        .neq("status", "cancelled")
        .neq("status", "rejected");

      if (error) {
        console.error("Error fetching booked slots:", error);
        return;
      }

      const booked: BookedSlot[] = [];
      data?.forEach((apt) => {
        const aptDate = new Date(apt.appointment_date);
        const hours = aptDate.getHours().toString().padStart(2, "0");
        const minutes = aptDate.getMinutes().toString().padStart(2, "0");
        const time = `${hours}:${minutes}`;

        const endTime = new Date(aptDate);
        endTime.setMinutes(endTime.getMinutes() + (apt.duration_minutes || 30));
        const endHours = endTime.getHours().toString().padStart(2, "0");
        const endMinutes = endTime.getMinutes().toString().padStart(2, "0");
        const endTimeStr = `${endHours}:${endMinutes}`;

        booked.push({ time, endTime: endTimeStr });
      });

      setBookedSlots(booked);
    } catch (error: any) {
      console.error("Error fetching booked slots:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Check if a time slot conflicts with existing appointments
  const isSlotBooked = (slot: string): boolean => {
    if (!selectedDate) return false;

    const [slotHours, slotMinutes] = slot.split(":").map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(slotHours, slotMinutes, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(duration));

    return bookedSlots.some((booked) => {
      const [bookedHours, bookedMinutes] = booked.time.split(":").map(Number);
      const [bookedEndHours, bookedEndMinutes] = booked.endTime.split(":").map(Number);

      const bookedStart = new Date(selectedDate);
      bookedStart.setHours(bookedHours, bookedMinutes, 0, 0);
      const bookedEnd = new Date(selectedDate);
      bookedEnd.setHours(bookedEndHours, bookedEndMinutes, 0, 0);

      // Check for overlap
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  };

  // Get available time slots for the selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    return timeSlots.filter((slot) => !isSlotBooked(slot));
  }, [selectedDate, bookedSlots, duration]);

  // Check if a date is available (not in unavailable_dates)
  const isDateAvailable = (date: Date) => {
    // If no unavailable dates are set, allow all future dates
    if (unavailableDates.length === 0) {
      return date >= new Date(new Date().setHours(0, 0, 0, 0));
    }

    // Check if date is explicitly marked as unavailable
    const isUnavailable = unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getFullYear() === date.getFullYear() &&
        unavailableDate.getMonth() === date.getMonth() &&
        unavailableDate.getDate() === date.getDate(),
    );

    if (isUnavailable) return false;

    // If available_dates table has entries, only allow those dates
    if (availableDates.length > 0) {
      return availableDates.some(
        (availableDate) =>
          availableDate.getFullYear() === date.getFullYear() &&
          availableDate.getMonth() === date.getMonth() &&
          availableDate.getDate() === date.getDate(),
      );
    }

    // Otherwise, allow any future date
    return date >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }

    if (!selectedDate || !timeSlot || !purpose.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for conflicts one more time before submitting
    if (isSlotBooked(timeSlot)) {
      toast.error("This time slot is no longer available. Please select another time.");
      // Refresh booked slots
      await fetchBookedSlots(selectedDate);
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const [hours, minutes] = timeSlot.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Final conflict check - query database directly
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: conflicts } = await supabase
        .from("appointments")
        .select("appointment_date, duration_minutes")
        .gte("appointment_date", startOfDay.toISOString())
        .lte("appointment_date", endOfDay.toISOString())
        .neq("status", "cancelled")
        .neq("status", "rejected");

      const hasConflict = conflicts?.some((apt) => {
        const aptDate = new Date(apt.appointment_date);
        const aptEnd = new Date(aptDate);
        aptEnd.setMinutes(aptEnd.getMinutes() + (apt.duration_minutes || 30));
        const slotEnd = new Date(appointmentDate);
        slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(duration));

        return appointmentDate < aptEnd && slotEnd > aptDate;
      });

      if (hasConflict) {
        toast.error("This time slot has been booked by someone else. Please select another time.");
        await fetchBookedSlots(selectedDate);
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          appointment_type: appointmentType,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: parseInt(duration),
          purpose: purpose.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast.success("Appointment request submitted! You'll receive an email once it's reviewed.");

      // Reset form
      setSelectedDate(undefined);
      setTimeSlot("");
      setPurpose("");
      setBookedSlots([]);

      // Redirect after short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error(`Failed to book appointment: ${error.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gradient-accent">Book an Appointment</h1>
            <p className="text-muted-foreground">
              Schedule a meeting with GNACOPS. Your request will be reviewed by our secretary.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Date Selection */}
              <Card className="hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Select Date & Time
                  </CardTitle>
                  <CardDescription>Choose your preferred appointment date and time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    {availableDates.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {availableDates.length} preferred date(s) available
                      </p>
                    )}
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                        // Disable dates marked as unavailable
                        return !isDateAvailable(date);
                      }}
                      className="rounded-md border mx-auto"
                    />
                    {selectedDate && (
                      <p className="text-sm text-muted-foreground text-center">
                        Selected:{" "}
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="time-slot">Time Slot *</Label>
                        {isLoadingSlots && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">Checking availability...</span>
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No available time slots for this date. Please select another date.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <Select value={timeSlot} onValueChange={setTimeSlot}>
                            <SelectTrigger id="time-slot" className="pointer-events-auto">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="pointer-events-auto max-h-[300px]">
                              {availableTimeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot} className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    {slot}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>{availableTimeSlots.length} slot(s) available</span>
                            {bookedSlots.length > 0 && (
                              <>
                                <span className="mx-1">•</span>
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span>{bookedSlots.length} slot(s) booked</span>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!selectedDate && (
                    <div className="space-y-2">
                      <Label htmlFor="time-slot">Time Slot *</Label>
                      <Select value={timeSlot} onValueChange={setTimeSlot} disabled>
                        <SelectTrigger id="time-slot" className="pointer-events-auto">
                          <SelectValue placeholder="Select a date first" />
                        </SelectTrigger>
                      </Select>
                      <p className="text-xs text-muted-foreground">Please select a date to see available time slots</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration" className="pointer-events-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="pointer-events-auto">
                        <SelectItem value="30" className="cursor-pointer">
                          30 minutes
                        </SelectItem>
                        <SelectItem value="60" className="cursor-pointer">
                          1 hour
                        </SelectItem>
                        <SelectItem value="90" className="cursor-pointer">
                          1.5 hours
                        </SelectItem>
                        <SelectItem value="120" className="cursor-pointer">
                          2 hours
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <Card className="hover-glow">
                  <CardHeader>
                    <CardTitle>Appointment Type *</CardTitle>
                    <CardDescription>Choose your preferred meeting format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={appointmentType}
                      onValueChange={(value: "in-person" | "virtual") => {
                        setAppointmentType(value);
                      }}
                      className="space-y-3"
                    >
                      <label
                        htmlFor="in-person"
                        className={`relative block p-4 rounded-lg border-2 cursor-pointer transition-all pointer-events-auto ${
                          appointmentType === "in-person"
                            ? "border-accent bg-accent/5 shadow-sm"
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="in-person" id="in-person" className="mt-1 pointer-events-auto" />
                          <div className="flex-1 pointer-events-none">
                            <div className="flex items-center gap-2 font-semibold mb-1">
                              <MapPin className="h-5 w-5 text-accent" />
                              In-Person Meeting
                            </div>
                            <p className="text-sm text-muted-foreground">Meet face-to-face at the GNACOPS office</p>
                          </div>
                        </div>
                      </label>
                      <label
                        htmlFor="virtual"
                        className={`relative block p-4 rounded-lg border-2 cursor-pointer transition-all pointer-events-auto ${
                          appointmentType === "virtual"
                            ? "border-accent bg-accent/5 shadow-sm"
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="virtual" id="virtual" className="mt-1 pointer-events-auto" />
                          <div className="flex-1 pointer-events-none">
                            <div className="flex items-center gap-2 font-semibold mb-1">
                              <Video className="h-5 w-5 text-accent" />
                              Virtual Meeting
                            </div>
                            <p className="text-sm text-muted-foreground">Join remotely via video conference</p>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card
                  className="hover-glow"
                  style={{
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <CardHeader>
                    <CardTitle>Purpose of Meeting *</CardTitle>
                    <CardDescription>Provide details about your meeting request</CardDescription>
                  </CardHeader>
                  <CardContent
                    className="space-y-3"
                    style={{
                      position: "relative",
                      zIndex: 10,
                      pointerEvents: "auto",
                    }}
                  >
                    <p className="text-sm text-muted-foreground">
                      Please describe the reason for your appointment. Include any specific topics or issues you'd like
                      to discuss.
                    </p>
                    <div style={{ position: "relative", zIndex: 20, pointerEvents: "auto" }}>
                      <Textarea
                        id="purpose-textarea"
                        name="purpose"
                        placeholder="Example: I would like to discuss my membership renewal and inquire about new services available for school proprietors. I also have questions regarding the certification process for my staff."
                        value={purpose}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow up to 2000 characters
                          if (value.length <= 2000) {
                            setPurpose(value);
                          }
                        }}
                        rows={8}
                        required
                        maxLength={2000}
                        className="resize-none focus:ring-2 focus:ring-accent transition-all w-full"
                        style={{
                          pointerEvents: "auto",
                          position: "relative",
                          zIndex: 30,
                          backgroundColor: "hsl(var(--background))",
                          cursor: "text",
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{purpose.length}/2000 characters</p>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    isSubmitting || !selectedDate || !timeSlot || !purpose.trim() || availableTimeSlots.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      Submit Appointment Request
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Your appointment request will be reviewed by our secretary. You'll receive an email notification once
                  it's approved or if any changes are needed.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookAppointment;
