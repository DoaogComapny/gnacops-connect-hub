import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface RecurringAppointment {
  id: string;
  appointment_type: string;
  duration_minutes: number;
  purpose: string;
  recurrence_pattern: string;
  recurrence_interval: number;
  start_date: string;
  end_date: string | null;
  days_of_week: number[];
  time_of_day: string;
  is_active: boolean;
  user_id: string;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const SecretaryRecurringAppointments = () => {
  const { toast } = useToast();
  const { user } = useSecretaryAuth();
  const [appointments, setAppointments] = useState<RecurringAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    appointment_type: 'virtual',
    duration_minutes: 30,
    purpose: '',
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    start_date: '',
    end_date: '',
    days_of_week: [] as number[],
    time_of_day: '09:00',
  });

  useEffect(() => {
    fetchRecurringAppointments();
  }, []);

  const fetchRecurringAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching recurring appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load recurring appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.purpose || !formData.start_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.recurrence_pattern === 'weekly' && formData.days_of_week.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one day for weekly recurrence",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('recurring_appointments')
        .insert({
          ...formData,
          user_id: user?.id,
          end_date: formData.end_date || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recurring appointment created",
      });

      setDialogOpen(false);
      setFormData({
        appointment_type: 'virtual',
        duration_minutes: 30,
        purpose: '',
        recurrence_pattern: 'weekly',
        recurrence_interval: 1,
        start_date: '',
        end_date: '',
        days_of_week: [],
        time_of_day: '09:00',
      });
      fetchRecurringAppointments();
    } catch (error) {
      console.error('Error creating recurring appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create recurring appointment",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_appointments')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Recurring appointment ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchRecurringAppointments();
    } catch (error) {
      console.error('Error toggling recurring appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update recurring appointment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring appointment?')) return;

    try {
      const { error } = await supabase
        .from('recurring_appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recurring appointment deleted",
      });

      fetchRecurringAppointments();
    } catch (error) {
      console.error('Error deleting recurring appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete recurring appointment",
        variant: "destructive",
      });
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gradient-accent">Recurring Appointments</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Recurring Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Recurring Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Appointment Type</Label>
                <Select
                  value={formData.appointment_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Purpose</Label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Meeting purpose..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_of_day: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Recurrence Pattern</Label>
                <Select
                  value={formData.recurrence_pattern}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_pattern: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurrence_pattern === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 mt-2">
                    {DAYS.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={formData.days_of_week.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Repeat Every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={formData.recurrence_interval}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_interval: parseInt(e.target.value) }))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.recurrence_pattern === 'daily' ? 'day(s)' : 
                     formData.recurrence_pattern === 'weekly' ? 'week(s)' : 'month(s)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Recurring Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No recurring appointments configured</p>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="p-6 hover-glow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{appointment.purpose}</h3>
                    <Badge variant={appointment.is_active ? "default" : "secondary"}>
                      {appointment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Type: {appointment.appointment_type}</p>
                    <p>Duration: {appointment.duration_minutes} minutes</p>
                    <p>Time: {appointment.time_of_day}</p>
                    <p>Recurs: Every {appointment.recurrence_interval} {appointment.recurrence_pattern}</p>
                    {appointment.recurrence_pattern === 'weekly' && appointment.days_of_week && (
                      <p>Days: {appointment.days_of_week.map(d => DAYS[d].label).join(', ')}</p>
                    )}
                    <p>Start: {new Date(appointment.start_date).toLocaleDateString()}</p>
                    {appointment.end_date && (
                      <p>End: {new Date(appointment.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(appointment.id, appointment.is_active)}
                  >
                    {appointment.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(appointment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SecretaryRecurringAppointments;
