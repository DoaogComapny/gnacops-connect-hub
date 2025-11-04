import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  tempPassword?: string;
  gnacopsId: string;
  hasPassword?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, fullName, tempPassword, gnacopsId, hasPassword }: WelcomeEmailRequest = await req.json();

    // Get SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabaseClient
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (smtpError || !smtpSettings) {
      throw new Error('SMTP settings not configured');
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials-box { background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credential-row { margin: 15px 0; }
            .label { font-weight: bold; color: #475569; }
            .value { font-family: monospace; background: #f1f5f9; padding: 8px; border-radius: 4px; display: inline-block; margin-left: 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to GNACOPS!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <p>Your GNACOPS membership application has been received and your account has been created. Below are your login credentials:</p>
              
              <div class="credentials-box">
                <div class="credential-row">
                  <span class="label">GNACOPS ID:</span>
                  <span class="value">${gnacopsId}</span>
                </div>
                <div class="credential-row">
                  <span class="label">Email:</span>
                  <span class="value">${email}</span>
                </div>
                ${!hasPassword && tempPassword ? `
                <div class="credential-row">
                  <span class="label">Temporary Password:</span>
                  <span class="value">${tempPassword}</span>
                </div>
                ` : ''}
              </div>
              
              ${!hasPassword && tempPassword ? `
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                For your security, please change your password immediately after your first login.
              </div>
              ` : ''}
              
              <p>You can log in to your account using the link below:</p>
              
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com')}/login" class="button">
                Login to Your Account
              </a>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Log in using your credentials above</li>
                ${!hasPassword && tempPassword ? '<li>Change your password in Account Settings</li>' : ''}
                <li>Complete your payment to activate your membership</li>
                <li>Wait for admin approval</li>
              </ol>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>
              <strong>GNACOPS Team</strong></p>
              
              <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>&copy; ${new Date().getFullYear()} GNACOPS. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const message = [
      `From: ${smtpSettings.from_name} <${smtpSettings.from_email}>`,
      `To: ${email}`,
      `Subject: Welcome to GNACOPS - Your Login Credentials`,
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
    const buffer = new Uint8Array(1024);

    // Read initial greeting
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
    await conn.write(encoder.encode(`RCPT TO:<${email}>\r\n`));
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

    console.log(`Welcome email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
