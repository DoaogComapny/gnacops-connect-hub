import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userEmail: string;
  userName: string;
  appointmentType: string;
  appointmentDate: string;
  purpose: string;
  status: 'approved' | 'rejected';
  secretaryNotes?: string;
  meetingLink?: string;
}

const getApprovalEmailHTML = (data: NotificationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✅ Appointment Approved</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.userName}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Great news! Your appointment has been approved. Here are the details:
              </p>
              <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">APPOINTMENT TYPE</p>
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${data.appointmentType}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">DATE & TIME</p>
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${new Date(data.appointmentDate).toLocaleString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">PURPOSE</p>
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${data.purpose}</p>
                    ${data.meetingLink ? `
                      <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">MEETING LINK</p>
                      <p style="margin: 0 0 20px;">
                        <a href="${data.meetingLink}" style="color: #667eea; text-decoration: none; font-size: 16px;">${data.meetingLink}</a>
                      </p>
                    ` : ''}
                    ${data.secretaryNotes ? `
                      <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">NOTES</p>
                      <p style="margin: 0; color: #333; font-size: 16px;">${data.secretaryNotes}</p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              ${data.meetingLink ? `
              <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${data.meetingLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Join Meeting</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                Please make sure to attend your appointment on time.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; color: #999; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0;">© ${new Date().getFullYear()} GNACOPS. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getRejectionEmailHTML = (data: NotificationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Appointment Update</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.userName}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                We regret to inform you that your appointment request could not be approved at this time.
              </p>
              <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">APPOINTMENT TYPE</p>
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${data.appointmentType}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">REQUESTED DATE & TIME</p>
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${new Date(data.appointmentDate).toLocaleString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">PURPOSE</p>
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${data.purpose}</p>
                    ${data.secretaryNotes ? `
                      <p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 600;">REASON</p>
                      <p style="margin: 0; color: #333; font-size: 16px;">${data.secretaryNotes}</p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                You are welcome to submit a new appointment request at a different time.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; color: #999; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0;">© ${new Date().getFullYear()} GNACOPS. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    const emailHTML = data.status === 'approved' 
      ? getApprovalEmailHTML(data)
      : getRejectionEmailHTML(data);

    const subject = data.status === 'approved'
      ? `✅ Your Appointment Has Been Approved - ${data.appointmentType}`
      : `Appointment Request Update - ${data.appointmentType}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GNACOPS <onboarding@resend.dev>',
        to: [data.userEmail],
        subject: subject,
        html: emailHTML,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in send-appointment-notification function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
