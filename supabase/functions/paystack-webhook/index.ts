import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get Paystack secret key
    const { data: settings } = await supabaseClient
      .from("site_settings")
      .select("settings_data")
      .single();

    const paystackSecretKey = settings?.settings_data?.paymentApiKey;
    if (!paystackSecretKey) {
      throw new Error("Paystack API key not configured");
    }

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    const hash = createHmac("sha512", paystackSecretKey)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid signature");
    }

    const event = JSON.parse(body);

    // Handle successful payment
    if (event.event === "charge.success") {
      const paymentId = event.data.reference;
      
      // Update payment status
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
          paystack_reference: event.data.reference,
        })
        .eq("id", paymentId);

      if (updateError) {
        console.error("Error updating payment:", updateError);
        throw updateError;
      }

      // Get payment details to update membership
      const { data: payment } = await supabaseClient
        .from("payments")
        .select("membership_id")
        .eq("id", paymentId)
        .single();

      if (payment?.membership_id) {
        // Get membership details to verify amount
        const { data: membership } = await supabaseClient
          .from("memberships")
          .select("user_id, category_id, form_categories(price)")
          .eq("id", payment.membership_id)
          .single();

        if (membership) {
          // Verify payment amount matches expected price
          const categoryData = membership.form_categories as any;
          const expectedPrice = categoryData?.price || 0;
          const paidAmount = event.data.amount / 100; // Paystack amounts are in kobo (cents)
          
          if (Math.abs(paidAmount - expectedPrice) > 0.01) {
            console.error(`Payment amount mismatch: expected ${expectedPrice}, got ${paidAmount}`);
            throw new Error("Payment amount does not match membership price");
          }

          // Update membership payment status
          await supabaseClient
            .from("memberships")
            .update({ payment_status: "paid" })
            .eq("id", payment.membership_id);

          // Activate user account with 1-year validity
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

          await supabaseClient
            .from("profiles")
            .update({
              status: "active",
              paid_until: oneYearFromNow.toISOString(),
              last_payment_at: new Date().toISOString(),
            })
            .eq("id", membership.user_id);

          // Generate certificate for the user
          try {
            const certificateResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-certificate`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({ membershipId: payment.membership_id }),
              }
            );

            const certificateResult = await certificateResponse.json();
            console.log("Certificate generation result:", certificateResult);
          } catch (certError) {
            console.error("Error generating certificate:", certError);
            // Don't fail the webhook if certificate generation fails
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
