import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  purpose: string;
  duration_minutes: number;
  meeting_link: string | null;
  user_id: string;
  reminder_sent: boolean;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting appointment reminder job...');

    // Get appointments for tomorrow that haven't had reminders sent
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'approved')
      .eq('reminder_sent', false)
      .gte('appointment_date', tomorrow.toISOString())
      .lt('appointment_date', dayAfterTomorrow.toISOString());

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments?.length || 0} appointments for reminders`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No appointments to remind', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get email template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', 'appointment_reminder')
      .eq('is_active', true)
      .single();

    let sentCount = 0;
    const errors: string[] = [];

    for (const appointment of appointments as Appointment[]) {
      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', appointment.user_id)
          .single();

        if (profileError || !profile) {
          console.error(`Error fetching profile for user ${appointment.user_id}:`, profileError);
          errors.push(`Failed to get profile for appointment ${appointment.id}`);
          continue;
        }

        const userProfile = profile as Profile;

        // Format appointment date
        const appointmentDate = new Date(appointment.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Prepare email content
        const subject = template?.subject || 'Reminder: Your Appointment Tomorrow';
        let htmlBody = template?.html_body || `
          <h1>Appointment Reminder</h1>
          <p>Dear {{userName}},</p>
          <p>This is a reminder that you have an appointment scheduled for tomorrow.</p>
          <p><strong>Date:</strong> {{appointmentDate}}</p>
          <p><strong>Time:</strong> {{appointmentTime}}</p>
          <p><strong>Type:</strong> {{appointmentType}}</p>
          <p><strong>Purpose:</strong> {{purpose}}</p>
          {{meetingLink}}
          <p>We look forward to seeing you!</p>
        `;

        // Replace variables
        htmlBody = htmlBody
          .replace(/{{userName}}/g, userProfile.full_name || 'User')
          .replace(/{{appointmentDate}}/g, formattedDate)
          .replace(/{{appointmentTime}}/g, formattedTime)
          .replace(/{{appointmentType}}/g, appointment.appointment_type)
          .replace(/{{purpose}}/g, appointment.purpose);

        if (appointment.meeting_link) {
          htmlBody = htmlBody.replace(
            /{{meetingLink}}/g,
            `<p><strong>Meeting Link:</strong> <a href="${appointment.meeting_link}">${appointment.meeting_link}</a></p>`
          );
        } else {
          htmlBody = htmlBody.replace(/{{meetingLink}}/g, '');
        }

        // Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'GNACOPS <onboarding@resend.dev>',
            to: [userProfile.email],
            subject: subject,
            html: htmlBody,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error(`Resend API error: ${await emailResponse.text()}`);
        }

        console.log('Reminder email sent successfully');

        // Mark as sent
        await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);

        // Track in analytics
        await supabase.from('email_analytics').insert({
          appointment_id: appointment.id,
          email_type: 'appointment_reminder',
          recipient_email: userProfile.email,
        });

        sentCount++;
      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
        errors.push(`Failed to send reminder for appointment ${appointment.id}: ${(error as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sent ${sentCount} appointment reminders`,
        count: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in send-appointment-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
