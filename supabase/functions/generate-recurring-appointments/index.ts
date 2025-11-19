import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringAppointment {
  id: string;
  user_id: string;
  appointment_type: string;
  purpose: string;
  duration_minutes: number;
  start_date: string;
  end_date: string | null;
  recurrence_pattern: string;
  recurrence_interval: number;
  days_of_week: number[] | null;
  time_of_day: string;
  is_active: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting recurring appointment generation job...');

    // Get active recurring appointments
    const { data: recurringAppointments, error: recurringError } = await supabase
      .from('recurring_appointments')
      .select('*')
      .eq('is_active', true);

    if (recurringError) {
      console.error('Error fetching recurring appointments:', recurringError);
      throw recurringError;
    }

    console.log(`Found ${recurringAppointments?.length || 0} active recurring appointments`);

    if (!recurringAppointments || recurringAppointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recurring appointments to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let createdCount = 0;
    const errors: string[] = [];

    for (const recurring of recurringAppointments as RecurringAppointment[]) {
      try {
        const startDate = new Date(recurring.start_date);
        const endDate = recurring.end_date ? new Date(recurring.end_date) : null;

        // Check if we should still generate appointments
        if (endDate && endDate < today) {
          console.log(`Recurring appointment ${recurring.id} has ended, skipping`);
          continue;
        }

        // Generate appointments for the next week
        const datesToCreate: Date[] = [];

        if (recurring.recurrence_pattern === 'daily') {
          for (let d = new Date(today); d <= nextWeek; d.setDate(d.getDate() + recurring.recurrence_interval)) {
            if (d >= startDate && (!endDate || d <= endDate)) {
              datesToCreate.push(new Date(d));
            }
          }
        } else if (recurring.recurrence_pattern === 'weekly' && recurring.days_of_week) {
          for (let d = new Date(today); d <= nextWeek; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (
              recurring.days_of_week.includes(dayOfWeek) &&
              d >= startDate &&
              (!endDate || d <= endDate)
            ) {
              datesToCreate.push(new Date(d));
            }
          }
        } else if (recurring.recurrence_pattern === 'monthly') {
          const startDay = startDate.getDate();
          for (let d = new Date(today); d <= nextWeek; d.setMonth(d.getMonth() + recurring.recurrence_interval)) {
            d.setDate(startDay);
            if (d >= startDate && (!endDate || d <= endDate)) {
              datesToCreate.push(new Date(d));
            }
          }
        }

        // Create appointments for each date
        for (const date of datesToCreate) {
          const [hours, minutes] = recurring.time_of_day.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);

          // Check if appointment already exists
          const { data: existing } = await supabase
            .from('appointments')
            .select('id')
            .eq('user_id', recurring.user_id)
            .eq('appointment_date', date.toISOString())
            .single();

          if (existing) {
            console.log(`Appointment already exists for ${date.toISOString()}, skipping`);
            continue;
          }

          // Create appointment
          const { error: insertError } = await supabase.from('appointments').insert({
            user_id: recurring.user_id,
            appointment_type: recurring.appointment_type,
            purpose: recurring.purpose,
            duration_minutes: recurring.duration_minutes,
            appointment_date: date.toISOString(),
            status: 'pending',
          });

          if (insertError) {
            console.error(`Error creating appointment:`, insertError);
            errors.push(`Failed to create appointment for ${date.toISOString()}: ${insertError.message}`);
          } else {
            createdCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing recurring appointment ${recurring.id}:`, error);
        errors.push(`Failed to process recurring appointment ${recurring.id}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Created ${createdCount} appointments from recurring templates`,
        count: createdCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in generate-recurring-appointments:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
