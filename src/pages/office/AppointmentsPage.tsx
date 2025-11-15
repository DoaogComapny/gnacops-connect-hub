import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, Loader2, Video, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/hooks/usePermissions";

interface Appointment {
  id: string;
  user_id: string;
  appointment_type: string;
  appointment_date: string;
  duration_minutes: number;
  purpose: string;
  status: string;
  secretary_notes: string | null;
  meeting_link: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [secretaryNotes, setSecretaryNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isSecretary = hasPermission("appointments.manage");

  useEffect(() => {
    fetchAppointments();
  }, [user, isSecretary]);

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_user_id_fkey(full_name, email)
        `)
        .order("appointment_date", { ascending: true });

      if (!isSecretary) {
        query = query.eq("user_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "approved",
          secretary_notes: secretaryNotes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Send notification email
      await supabase.functions.invoke("send-email", {
        body: {
          to: selectedAppointment?.profiles.email,
          subject: "Appointment Approved",
          html: `Your appointment on ${new Date(selectedAppointment?.appointment_date || "").toLocaleString()} has been approved.`,
        },
      });

      toast.success("Appointment approved");
      setSelectedAppointment(null);
      setSecretaryNotes("");
      fetchAppointments();
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast.error("Failed to approve appointment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "rejected",
          secretary_notes: secretaryNotes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Send notification email
      await supabase.functions.invoke("send-email", {
        body: {
          to: selectedAppointment?.profiles.email,
          subject: "Appointment Update",
          html: `Your appointment request has been reviewed. ${secretaryNotes ? `Note: ${secretaryNotes}` : ""}`,
        },
      });

      toast.success("Appointment rejected");
      setSelectedAppointment(null);
      setSecretaryNotes("");
      fetchAppointments();
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast.error("Failed to reject appointment");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="hover-glow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {isSecretary && appointment.profiles.full_name}
              {!isSecretary && "Your Appointment"}
            </CardTitle>
            <CardDescription>{appointment.purpose}</CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {new Date(appointment.appointment_date).toLocaleTimeString()} ({appointment.duration_minutes} min)
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {appointment.appointment_type === "virtual" ? (
            <>
              <Video className="h-4 w-4 text-muted-foreground" />
              <span>Virtual Meeting</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>In-Person</span>
            </>
          )}
        </div>

        {appointment.meeting_link && (
          <Button variant="outline" className="w-full" asChild>
            <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer">
              Join Meeting
            </a>
          </Button>
        )}

        {appointment.secretary_notes && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">Secretary Notes:</p>
            <p>{appointment.secretary_notes}</p>
          </div>
        )}

        {isSecretary && appointment.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedAppointment(appointment)}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const approvedAppointments = appointments.filter((a) => a.status === "approved");
  const completedAppointments = appointments.filter((a) => a.status === "completed");
  const rejectedAppointments = appointments.filter((a) => a.status === "rejected" || a.status === "cancelled");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Appointments</h1>
        <p className="text-muted-foreground">
          {isSecretary ? "Manage appointment requests from members" : "View and manage your appointments"}
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No pending appointments
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No approved appointments
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No completed appointments
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No rejected appointments
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Secretary Review Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Appointment</DialogTitle>
            <DialogDescription>
              Approve or reject this appointment request
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Member</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.profiles.full_name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Purpose</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.purpose}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAppointment.appointment_date).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.appointment_type === "virtual" ? "Virtual Meeting" : "In-Person"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add notes for the member..."
                  value={secretaryNotes}
                  onChange={(e) => setSecretaryNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedAppointment(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReject(selectedAppointment!.id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Reject
            </Button>
            <Button
              onClick={() => handleApprove(selectedAppointment!.id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
