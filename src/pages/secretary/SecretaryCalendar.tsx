import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";

const SecretaryCalendar = () => {
  const { toast } = useToast();
  const { user } = useSecretaryAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    try {
      const [availableRes, bookedRes] = await Promise.all([
        supabase.from('available_dates').select('date').eq('is_available', true),
        supabase.from('appointments').select('appointment_date').in('status', ['approved', 'pending']),
      ]);

      if (availableRes.data) {
        setAvailableDates(availableRes.data.map(d => d.date));
      }

      if (bookedRes.data) {
        setBookedDates(bookedRes.data.map(a => a.appointment_date.split('T')[0]));
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = date.toISOString().split('T')[0];

    // Don't allow selecting booked dates
    if (bookedDates.includes(dateStr)) {
      toast({
        title: "Date Unavailable",
        description: "This date is already booked",
        variant: "destructive",
      });
      return;
    }

    // Don't allow past dates
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      toast({
        title: "Invalid Date",
        description: "Cannot select past dates",
        variant: "destructive",
      });
      return;
    }

    // Toggle selection
    setSelectedDates(prev => {
      const exists = prev.some(d => d.toISOString().split('T')[0] === dateStr);
      if (exists) {
        return prev.filter(d => d.toISOString().split('T')[0] !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleMarkAvailable = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "No Dates Selected",
        description: "Please select dates to mark as available",
        variant: "destructive",
      });
      return;
    }

    try {
      const inserts = selectedDates.map(date => ({
        date: date.toISOString().split('T')[0],
        is_available: true,
        created_by: user?.id,
      }));

      const { error } = await supabase
        .from('available_dates')
        .upsert(inserts, { onConflict: 'date' });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Marked ${selectedDates.length} date(s) as available`,
      });

      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error('Error marking dates:', error);
      toast({
        title: "Error",
        description: "Failed to mark dates as available",
        variant: "destructive",
      });
    }
  };

  const handleMarkUnavailable = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "No Dates Selected",
        description: "Please select dates to mark as unavailable",
        variant: "destructive",
      });
      return;
    }

    try {
      const dateStrs = selectedDates.map(d => d.toISOString().split('T')[0]);

      const { error } = await supabase
        .from('available_dates')
        .delete()
        .in('date', dateStrs);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Marked ${selectedDates.length} date(s) as unavailable`,
        variant: "destructive",
      });

      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error('Error marking dates:', error);
      toast({
        title: "Error",
        description: "Failed to mark dates as unavailable",
        variant: "destructive",
      });
    }
  };

  const modifiers = {
    available: (date: Date) => availableDates.includes(date.toISOString().split('T')[0]),
    booked: (date: Date) => bookedDates.includes(date.toISOString().split('T')[0]),
    selected: (date: Date) => selectedDates.some(d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0]),
  };

  const modifiersClassNames = {
    available: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
    booked: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
    selected: "bg-accent text-accent-foreground",
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
      <h1 className="text-3xl font-bold text-gradient-accent mb-6">Calendar Setup</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              onDayClick={handleDateSelect}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100">
                  Available
                </Badge>
                <span className="text-sm">Dates open for booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Booked</Badge>
                <span className="text-sm">Dates with appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Selected</Badge>
                <span className="text-sm">Your current selection</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Actions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Selected: {selectedDates.length} date(s)
            </p>
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full"
                onClick={handleMarkAvailable}
                disabled={selectedDates.length === 0}
              >
                Mark as Available
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleMarkUnavailable}
                disabled={selectedDates.length === 0}
              >
                Mark as Unavailable
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Statistics</h3>
            <div className="space-y-1 text-sm">
              <p>Available Dates: <strong>{availableDates.length}</strong></p>
              <p>Booked Dates: <strong>{bookedDates.length}</strong></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecretaryCalendar;
