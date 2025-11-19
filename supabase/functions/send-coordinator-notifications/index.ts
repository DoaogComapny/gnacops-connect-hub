import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all district and regional coordinators
    const { data: coordinators, error: coordError } = await supabase
      .from("staff_assignments")
      .select(`
        user_id,
        region,
        district,
        role,
        profiles:user_id (email, full_name)
      `)
      .in("role", ["district_coordinator", "regional_coordinator"]);

    if (coordError) throw coordError;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const coordinator of coordinators || []) {
      const notifications: any[] = [];

      // Build query based on coordinator type
      let query = supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          memberships!inner(
            gnacops_id,
            payment_status,
            status
          ),
          profiles!inner(
            paid_until,
            status
          )
        `)
        .eq("submission_data->>region", coordinator.region);

      // Add district filter for district coordinators
      if (coordinator.role === "district_coordinator") {
        query = query.eq("submission_data->>district", coordinator.district);
      }

      const { data: schools, error: schoolsError } = await query;
      if (schoolsError) {
        console.error("Error fetching schools:", schoolsError);
        continue;
      }

      for (const school of schools || []) {
        const schoolData = school.submission_data as any;
        const schoolName = schoolData?.schoolName || "Unknown School";
        const membership = Array.isArray(school.memberships) ? school.memberships[0] : school.memberships;
        const profile = Array.isArray(school.profiles) ? school.profiles[0] : school.profiles;

        // Check for overdue payments
        if (membership?.payment_status === "unpaid") {
          notifications.push({
            coordinator_id: coordinator.user_id,
            school_id: school.id,
            notification_type: "overdue_payment",
            title: "Overdue Payment",
            message: `${schoolName} has an overdue payment`,
            priority: "high",
          });
        }

        // Check for expired memberships
        if (profile?.status === "expired") {
          notifications.push({
            coordinator_id: coordinator.user_id,
            school_id: school.id,
            notification_type: "expired_membership",
            title: "Expired Membership",
            message: `${schoolName} membership has expired`,
            priority: "urgent",
          });
        }

        // Check for renewals due within 30 days
        if (profile?.paid_until) {
          const paidUntil = new Date(profile.paid_until);
          if (paidUntil > now && paidUntil <= thirtyDaysFromNow) {
            const daysLeft = Math.floor((paidUntil.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
            notifications.push({
              coordinator_id: coordinator.user_id,
              school_id: school.id,
              notification_type: "renewal_due",
              title: "Renewal Due Soon",
              message: `${schoolName} membership expires in ${daysLeft} days`,
              priority: daysLeft <= 7 ? "high" : "normal",
            });
          }
        }
      }

      // Insert notifications
      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from("coordinator_notifications")
          .insert(notifications);

        if (insertError) {
          console.error("Error inserting notifications:", insertError);
          continue;
        }

        // Send email summary
        const coordinatorProfile = Array.isArray(coordinator.profiles) ? coordinator.profiles[0] : coordinator.profiles;
        const coordinatorEmail = coordinatorProfile?.email;
        const coordinatorName = coordinatorProfile?.full_name || "Coordinator";

        if (coordinatorEmail && resendApiKey) {
          const urgentCount = notifications.filter(n => n.priority === "urgent").length;
          const highCount = notifications.filter(n => n.priority === "high").length;

          const emailBody = `
            <h2>GNACOPS Coordinator Alert Summary</h2>
            <p>Dear ${coordinatorName},</p>
            <p>You have ${notifications.length} new alert(s) requiring attention:</p>
            <ul>
              <li>Urgent: ${urgentCount}</li>
              <li>High Priority: ${highCount}</li>
              <li>Normal: ${notifications.length - urgentCount - highCount}</li>
            </ul>
            <p>Please log in to your coordinator dashboard to view details and take action.</p>
            <br>
            <p>Best regards,<br>GNACOPS System</p>
          `;

          try {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "GNACOPS <notifications@gnacops.org>",
                to: [coordinatorEmail],
                subject: `GNACOPS Alert: ${notifications.length} New Notification(s)`,
                html: emailBody,
              }),
            });

            if (!response.ok) {
              console.error("Failed to send email:", await response.text());
            }
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-coordinator-notifications:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});