import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CalendarDays, CalendarOff, Cloud, CalendarCheck } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";
import { format } from "date-fns";

const SecretaryCalendar = () => {
  const { user } = useSecretaryAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    try {
      const { data: availData, error: availError } = await supabase
        .from("available_dates")
        .select("date, is_available")
        .gte("date", new Date().toISOString().split("T")[0]);

      if (availError) throw availError;

      const { data: bookedData, error: bookedError } = await supabase
        .from("appointments")
        .select("appointment_date")
        .neq("status", "cancelled");

      if (bookedError) throw bookedError;

      const available: Date[] = [];
      const unavailable: Date[] = [];
      
      availData?.forEach(item => {
        const date = new Date(item.date + "T00:00:00");
        if (item.is_available) {
          available.push(date);
        } else {
          unavailable.push(date);
        }
      });

      setAvailableDates(available);
      setUnavailableDates(unavailable);
      setBookedDates(
        bookedData?.map(item => new Date(item.appointment_date)) || []
      );
    } catch (error: any) {
      console.error("Error fetching dates:", error);
      toast.error("Failed to load dates");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error("Cannot select past dates");
      return;
    }

    const hasAppointments = bookedDates.some(
      bookedDate =>
        bookedDate.getFullYear() === date.getFullYear() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getDate() === date.getDate()
    );

    if (hasAppointments) {
      toast.error("This date has scheduled appointments and cannot be modified");
      return;
    }

    setSelectedDates(prev => {
      const isSelected = prev.some(
        d =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );

      if (isSelected) {
        return prev.filter(
          d =>
            !(
              d.getFullYear() === date.getFullYear() &&
              d.getMonth() === date.getMonth() &&
              d.getDate() === date.getDate()
            )
        );
      } else {
        return [...prev, date];
      }
    });
  };

  const handleSelectEntireMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates: Date[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      if (date >= today) {
        const hasAppointments = bookedDates.some(
          bookedDate =>
            bookedDate.getFullYear() === date.getFullYear() &&
            bookedDate.getMonth() === date.getMonth() &&
            bookedDate.getDate() === date.getDate()
        );

        if (!hasAppointments) {
          monthDates.push(date);
        }
      }
    }

    setSelectedDates(monthDates);
    toast.success(`Selected ${monthDates.length} days from ${format(selectedMonth, 'MMMM yyyy')}`);
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
      toast.error("Please select dates to mark as available");
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
        try {
          await syncToGoogleCalendar(date, 'add');
        } catch (error) {
          console.error('Sync error for date:', date, error);
        }
      }

      toast.success(`Marked ${selectedDates.length} date(s) as available`);
      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error('Error marking dates as available:', error);
      toast.error("Failed to mark dates as available");
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkUnavailable = async () => {
    if (selectedDates.length === 0) {
      toast.error("Please select dates to block");
      return;
    }

    setSyncing(true);
    try {
      const inserts = selectedDates.map(date => ({
        date: date.toISOString().split('T')[0],
        is_available: false,
        created_by: user?.id,
      }));

      const { error } = await supabase
        .from('available_dates')
        .upsert(inserts, { onConflict: 'date' });

      if (error) throw error;

      // Sync to Google Calendar
      for (const date of selectedDates) {
        try {
          await syncToGoogleCalendar(date, 'remove');
        } catch (error) {
          console.error('Sync error for date:', date, error);
        }
      }

      toast.success(`Blocked ${selectedDates.length} date(s)`);
      setSelectedDates([]);
      fetchDates();
    } catch (error) {
      console.error('Error marking dates as unavailable:', error);
      toast.error("Failed to block dates");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent mb-2">Calendar Setup</h1>
        <p className="text-muted-foreground">Manage available dates for appointments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSelectEntireMonth}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                Select Entire {format(selectedMonth, 'MMMM')}
              </Button>
            </div>

            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => dates && setSelectedDates(dates)}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              modifiers={{
                available: availableDates,
                booked: bookedDates,
                unavailable: unavailableDates,
              }}
              modifiersClassNames={{
                selected: "bg-accent text-accent-foreground hover:bg-accent/90",
                available: "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50",
                booked: "bg-yellow-100 dark:bg-yellow-900/30 line-through cursor-not-allowed",
                unavailable: "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50",
              }}
              className="rounded-md border mx-auto"
              disabled={(date) => {
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const hasAppointments = bookedDates.some(
                  bookedDate =>
                    bookedDate.getFullYear() === date.getFullYear() &&
                    bookedDate.getMonth() === date.getMonth() &&
                    bookedDate.getDate() === date.getDate()
                );
                return isPast || hasAppointments;
              }}
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
                    Block Dates
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
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 border" />
                <span className="text-sm">Available for booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900 border" />
                <span className="text-sm">Blocked/Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900 border" />
                <span className="text-sm">Has appointments (locked)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent border" />
                <span className="text-sm">Selected dates</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                  {availableDates.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Blocked</span>
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                  {unavailableDates.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Booked</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100">
                  {bookedDates.length}
                </Badge>
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
