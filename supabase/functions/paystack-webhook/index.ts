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
        // Update membership payment status
        await supabaseClient
          .from("memberships")
          .update({ payment_status: "paid" })
          .eq("id", payment.membership_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
