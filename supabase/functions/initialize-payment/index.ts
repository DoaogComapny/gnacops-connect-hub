import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { paymentId, email } = await req.json();

    if (!paymentId || !email) {
      throw new Error("Missing required fields");
    }

    // Fetch payment details with dynamic pricing from form categories
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        memberships!inner(
          *,
          form_categories!inner(
            name,
            price
          )
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // Use dynamic price from form categories (freshly fetched)
    const dynamicPrice = payment.memberships?.form_categories?.price || payment.amount;
    
    // Verify payment amount matches current plan price
    if (Math.abs(payment.amount - dynamicPrice) > 0.01) {
      console.warn(`Payment amount (${payment.amount}) differs from current price (${dynamicPrice}). Using current price.`);
    }

    // Get Paystack API key from settings
    const { data: settings } = await supabaseClient
      .from("site_settings")
      .select("settings_data")
      .single();

    const paystackSecretKey = settings?.settings_data?.paymentApiKey;
    if (!paystackSecretKey) {
      throw new Error("Paystack API key not configured");
    }

    // Initialize Paystack transaction using dynamic price
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        amount: Math.round(dynamicPrice * 100), // Paystack expects amount in kobo/pesewas, using current price
        currency: payment.currency || "GHS",
        reference: payment.id,
        callback_url: `${req.headers.get("origin")}/user/dashboard/payments?payment_id=${payment.id}`,
        metadata: {
          payment_id: payment.id,
          membership_id: payment.membership_id,
          user_id: payment.user_id,
          plan_name: payment.memberships?.form_categories?.name,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Failed to initialize payment");
    }

    // Update payment with Paystack reference
    await supabaseClient
      .from("payments")
      .update({ paystack_reference: paystackData.data.reference })
      .eq("id", paymentId);

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
