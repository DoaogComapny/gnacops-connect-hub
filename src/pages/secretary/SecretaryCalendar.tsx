import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarDays, CalendarOff, Cloud } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";

const SecretaryCalendar = () => {
  const { toast } = useToast();
  const { user } = useSecretaryAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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

  const syncToGoogleCalendar = async (date: Date, action: 'add' | 'remove') => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: action === 'add' ? 'sync_available_date' : 'remove_available_date',
          date: dateStr,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google Calendar sync error:', error);
      throw error;
    }
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

    setSyncing(true);
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

      // Sync to Google Calendar
      for (const date of selectedDates) {
        await syncToGoogleCalendar(date, 'add');
      }

      toast({
        title: "Success",
        description: `Marked ${selectedDates.length} date(s) as available and synced to Google Calendar`,
      });

      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error('Error marking dates as available:', error);
      toast({
        title: "Error",
        description: "Failed to mark dates as available. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
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

    setSyncing(true);
    try {
      const datesToRemove = selectedDates.map(date => date.toISOString().split('T')[0]);

      const { error } = await supabase
        .from('available_dates')
        .delete()
        .in('date', datesToRemove);

      if (error) throw error;

      // Sync to Google Calendar
      for (const date of selectedDates) {
        await syncToGoogleCalendar(date, 'remove');
      }

      toast({
        title: "Success",
        description: `Marked ${selectedDates.length} date(s) as unavailable and synced to Google Calendar`,
      });

      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error('Error marking dates as unavailable:', error);
      toast({
        title: "Error",
        description: "Failed to mark dates as unavailable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const modifiers = {
    available: availableDates.map(d => new Date(d)),
    booked: bookedDates.map(d => new Date(d)),
    selected: selectedDates,
  };

  const modifiersClassNames = {
    available: "bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900 dark:text-green-100",
    booked: "bg-red-100 text-red-900 line-through dark:bg-red-900 dark:text-red-100",
    selected: "bg-primary text-primary-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent mb-2">Calendar Setup</h1>
        <p className="text-muted-foreground">Manage available dates for appointments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => {
                if (Array.isArray(dates)) {
                  setSelectedDates(dates);
                }
              }}
              onDayClick={handleDateSelect}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border mx-auto"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleMarkAvailable}
                className="flex-1"
                disabled={syncing || selectedDates.length === 0}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Mark Available
                  </>
                )}
              </Button>
              <Button
                onClick={handleMarkUnavailable}
                variant="outline"
                className="flex-1"
                disabled={syncing || selectedDates.length === 0}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CalendarOff className="mr-2 h-4 w-4" />
                    Mark Unavailable
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Legend</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cloud className="h-4 w-4 text-green-500" />
                <span>Synced</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900" />
                <span className="text-sm">Available Dates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900" />
                <span className="text-sm">Booked Dates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span className="text-sm">Selected Dates</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <Badge variant="secondary">{availableDates.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Booked</span>
                <Badge variant="secondary">{bookedDates.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selected</span>
                <Badge variant="secondary">{selectedDates.length}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecretaryCalendar;
