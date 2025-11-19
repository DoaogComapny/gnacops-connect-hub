import { useState, useEffect } from "react";
import { Calendar, Check, X, Clock, Video, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";

interface Appointment {
  id: string;
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
    phone: string;
  } | null;
}

const SecretaryAppointments = () => {
  const { toast } = useToast();
  const { user } = useSecretaryAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_type,
          appointment_date,
          duration_minutes,
          purpose,
          status,
          secretary_notes,
          meeting_link,
          created_at,
          user_id,
          profiles!appointments_user_id_fkey(full_name, email, phone)
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.secretary_notes || "");
    setMeetingLink(appointment.meeting_link || "");
    setIsDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'approved',
          secretary_notes: notes,
          meeting_link: meetingLink,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      // Sync to Google Calendar
      try {
        await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'sync_appointment',
            appointmentId: selectedAppointment.id,
          },
        });
        
        toast({
          title: "Success",
          description: "Appointment approved and synced to Google Calendar",
        });
      } catch (syncError) {
        console.error('Google Calendar sync error:', syncError);
        toast({
          title: "Partially Successful",
          description: "Appointment approved but Google Calendar sync failed. Please try syncing manually.",
          variant: "default",
        });
      }

      setIsDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast({
        title: "Error",
        description: "Failed to approve appointment",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment rejected",
        variant: "destructive",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reject appointment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const filterAppointments = (status?: string) => {
    if (!status) return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="p-6 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {appointment.appointment_type === 'virtual' ? (
            <Video className="h-5 w-5 text-accent" />
          ) : (
            <MapPin className="h-5 w-5 text-accent" />
          )}
          <div>
            <h4 className="font-semibold">{appointment.profiles?.full_name || 'Unknown'}</h4>
            <p className="text-sm text-muted-foreground">{appointment.profiles?.email}</p>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{new Date(appointment.appointment_date).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>{appointment.duration_minutes} minutes</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Purpose:</strong> {appointment.purpose}
        </p>
        {appointment.secretary_notes && (
          <p className="text-sm text-muted-foreground">
            <strong>Notes:</strong> {appointment.secretary_notes}
          </p>
        )}
        {appointment.meeting_link && (
          <p className="text-sm">
            <strong>Meeting Link:</strong>{" "}
            <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              {appointment.meeting_link}
            </a>
          </p>
        )}
      </div>

      {appointment.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleApprove(appointment)}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleReject(appointment.id)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gradient-accent mb-6">Appointment Management</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterAppointments('pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filterAppointments('approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterAppointments('rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {appointments.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterAppointments('pending').map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterAppointments('approved').map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterAppointments('rejected').map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Secretary Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for this appointment..."
              />
            </div>
            {selectedAppointment?.appointment_type === 'virtual' && (
              <div>
                <Label>Meeting Link</Label>
                <Textarea
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
            <Button onClick={confirmApprove} className="w-full">
              Confirm Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecretaryAppointments;
