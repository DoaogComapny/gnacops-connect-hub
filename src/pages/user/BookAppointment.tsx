import { useState } from "react";
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
import { Loader2, Calendar as CalendarIcon, Video, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [appointmentType, setAppointmentType] = useState<"in-person" | "virtual">("in-person");
  const [duration, setDuration] = useState("30");
  const [timeSlot, setTimeSlot] = useState("");
  const [purpose, setPurpose] = useState("");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30",
  ];

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

    setIsSubmitting(true);

    try {
      // Combine date and time
      const [hours, minutes] = timeSlot.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      console.log("Booking appointment:", {
        user_id: user.id,
        appointment_type: appointmentType,
        appointment_date: appointmentDate.toISOString(),
        duration_minutes: parseInt(duration),
        purpose: purpose.trim(),
      });

      const { data, error } = await supabase.from("appointments").insert({
        user_id: user.id,
        appointment_type: appointmentType,
        appointment_date: appointmentDate.toISOString(),
        duration_minutes: parseInt(duration),
        purpose: purpose.trim(),
        status: "pending",
      }).select().single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Appointment booked successfully:", data);
      toast.success("Appointment request submitted! You'll receive an email once it's reviewed.");
      
      // Reset form
      setSelectedDate(undefined);
      setTimeSlot("");
      setPurpose("");
      
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
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="rounded-md border mx-auto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-slot">Time Slot *</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger id="time-slot" className="pointer-events-auto">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="pointer-events-auto">
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot} className="cursor-pointer">
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration" className="pointer-events-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="pointer-events-auto">
                        <SelectItem value="30" className="cursor-pointer">30 minutes</SelectItem>
                        <SelectItem value="60" className="cursor-pointer">1 hour</SelectItem>
                        <SelectItem value="90" className="cursor-pointer">1.5 hours</SelectItem>
                        <SelectItem value="120" className="cursor-pointer">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <Card className="hover-glow">
                  <CardHeader>
                    <CardTitle>Appointment Type</CardTitle>
                    <CardDescription>How would you like to meet?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={appointmentType} 
                      onValueChange={(value: any) => setAppointmentType(value)}
                      className="pointer-events-auto"
                    >
                      <div 
                        className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setAppointmentType("in-person")}
                      >
                        <RadioGroupItem value="in-person" id="in-person" className="pointer-events-auto" />
                        <Label htmlFor="in-person" className="flex items-center gap-2 cursor-pointer flex-1">
                          <MapPin className="h-4 w-4" />
                          In-Person Meeting
                        </Label>
                      </div>
                      <div 
                        className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setAppointmentType("virtual")}
                      >
                        <RadioGroupItem value="virtual" id="virtual" className="pointer-events-auto" />
                        <Label htmlFor="virtual" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Video className="h-4 w-4" />
                          Virtual Meeting
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card className="hover-glow">
                  <CardHeader>
                    <CardTitle>Purpose of Meeting *</CardTitle>
                    <CardDescription>Tell us what you'd like to discuss</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Describe the purpose of your appointment..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={6}
                      required
                      className="pointer-events-auto"
                    />
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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
