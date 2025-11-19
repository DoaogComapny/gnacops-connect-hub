import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate JWT for Google Service Account
async function generateJWT() {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
  
  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google Calendar credentials');
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedClaim = btoa(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  // Import private key and sign
  const keyData = privateKey.replace(/\\n/g, '\n');
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = keyData.substring(
    pemHeader.length,
    keyData.length - pemFooter.length
  ).trim();
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${encodedHeader}.${encodedClaim}.${encodedSignature}`;
}

// Get access token from Google
async function getAccessToken() {
  const jwt = await generateJWT();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  return data.access_token;
}

// Create or update calendar event
async function syncEventToCalendar(accessToken: string, event: any, eventId?: string) {
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
  const url = eventId
    ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`
    : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

  const response = await fetch(url, {
    method: eventId ? 'PUT' : 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Calendar API error:', error);
    throw new Error(`Failed to sync event: ${error}`);
  }

  return await response.json();
}

// Delete calendar event
async function deleteEventFromCalendar(accessToken: string, eventId: string) {
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    console.error('Google Calendar API error:', error);
    throw new Error(`Failed to delete event: ${error}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, date, appointmentId, appointmentData } = await req.json();
    const accessToken = await getAccessToken();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    let result;

    switch (action) {
      case 'sync_available_date': {
        // Create all-day event for available date
        const event = {
          summary: 'Available for Appointments',
          description: 'This date is available for booking appointments',
          start: { date },
          end: { date },
          colorId: '2', // Green color
        };
        result = await syncEventToCalendar(accessToken, event);
        break;
      }

      case 'remove_available_date': {
        // Find and delete the available date event
        const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
        const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${date}T00:00:00Z&timeMax=${date}T23:59:59Z&q=Available for Appointments`;
        
        const listResponse = await fetch(listUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        const events = await listResponse.json();
        if (events.items && events.items.length > 0) {
          await deleteEventFromCalendar(accessToken, events.items[0].id);
        }
        result = { success: true };
        break;
      }

      case 'sync_appointment': {
        const { data: appointment } = await supabaseClient
          .from('appointments')
          .select('*, profiles!appointments_user_id_fkey(full_name, email, phone)')
          .eq('id', appointmentId)
          .single();

        if (!appointment) {
          throw new Error('Appointment not found');
        }

        const profile = appointment.profiles;
        const startTime = new Date(appointment.appointment_date);
        const endTime = new Date(startTime.getTime() + appointment.duration_minutes * 60000);

        const event = {
          summary: `Appointment: ${appointment.appointment_type}`,
          description: `Purpose: ${appointment.purpose}\nUser: ${profile?.full_name || 'N/A'}\nEmail: ${profile?.email || 'N/A'}\nPhone: ${profile?.phone || 'N/A'}`,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'UTC',
          },
          attendees: profile?.email ? [{ email: profile.email }] : [],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
          colorId: '5', // Yellow color
        };

        result = await syncEventToCalendar(
          accessToken,
          event,
          appointment.google_calendar_event_id || undefined
        );

        // Update appointment with Google Calendar event ID
        await supabaseClient
          .from('appointments')
          .update({ google_calendar_event_id: result.id })
          .eq('id', appointmentId);
        
        break;
      }

      case 'delete_appointment': {
        const { data: appointment } = await supabaseClient
          .from('appointments')
          .select('google_calendar_event_id')
          .eq('id', appointmentId)
          .single();

        if (appointment?.google_calendar_event_id) {
          await deleteEventFromCalendar(accessToken, appointment.google_calendar_event_id);
        }
        result = { success: true };
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
