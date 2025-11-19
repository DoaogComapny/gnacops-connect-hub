import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has permission to send emails (admin, super_admin, or secretary)
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Role verification failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const canSendEmail = roles?.some(r => 
      ['admin', 'super_admin', 'secretary'].includes(r.role)
    );

    if (!canSendEmail) {
      console.error('User lacks email sending permissions:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions to send emails' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Email send authorized for user: ${user.id}`);

    // Get SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (smtpError || !smtpSettings) {
      throw new Error('SMTP settings not configured');
    }

    const { to, subject, html, text }: EmailRequest = await req.json();

    // Use Deno's SMTP capabilities with the configured settings
    const message = [
      `From: ${smtpSettings.from_name} <${smtpSettings.from_email}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      html
    ].join('\r\n');

    // Connect to SMTP server
    const conn = await Deno.connect({
      hostname: smtpSettings.host,
      port: smtpSettings.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Read initial greeting
    const buffer = new Uint8Array(1024);
    await conn.read(buffer);

    // EHLO
    await conn.write(encoder.encode(`EHLO ${smtpSettings.host}\r\n`));
    await conn.read(buffer);

    // AUTH LOGIN
    await conn.write(encoder.encode(`AUTH LOGIN\r\n`));
    await conn.read(buffer);

    // Username
    const username = btoa(smtpSettings.username);
    await conn.write(encoder.encode(`${username}\r\n`));
    await conn.read(buffer);

    // Password
    const password = btoa(smtpSettings.password);
    await conn.write(encoder.encode(`${password}\r\n`));
    await conn.read(buffer);

    // MAIL FROM
    await conn.write(encoder.encode(`MAIL FROM:<${smtpSettings.from_email}>\r\n`));
    await conn.read(buffer);

    // RCPT TO
    await conn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    await conn.read(buffer);

    // DATA
    await conn.write(encoder.encode(`DATA\r\n`));
    await conn.read(buffer);

    // Message
    await conn.write(encoder.encode(`${message}\r\n.\r\n`));
    await conn.read(buffer);

    // QUIT
    await conn.write(encoder.encode(`QUIT\r\n`));
    conn.close();

    console.log(`Email sent successfully to ${to}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});