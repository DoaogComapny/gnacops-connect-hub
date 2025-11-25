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
            price,
            secondary_price,
            secondary_price_label
          )
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // Get payment settings
    const { data: settings } = await supabaseClient
      .from("site_settings")
      .select("settings_data")
      .single();

    const paystackSecretKey = settings?.settings_data?.paymentApiKey;
    const secondaryPaystackSecretKey = settings?.settings_data?.secondaryPaymentApiKey;
    const enableSecondaryPricing = settings?.settings_data?.enableSecondaryPricing || false;
    
    if (!paystackSecretKey) {
      throw new Error("Paystack API key not configured");
    }

    // Get pricing
    const primaryPrice = payment.memberships?.form_categories?.price || payment.amount;
    const secondaryPrice = payment.memberships?.form_categories?.secondary_price || 0;
    const totalAmount = primaryPrice + secondaryPrice;

    console.log("Payment breakdown:", {
      primaryPrice,
      secondaryPrice,
      totalAmount,
      enableSecondaryPricing,
      categoryName: payment.memberships?.form_categories?.name
    });

    // If secondary pricing is enabled AND there's a secondary price AND secondary key is configured, process dual payment
    if (enableSecondaryPricing && secondaryPrice > 0 && secondaryPaystackSecretKey) {
      console.log("Processing dual payment to two Paystack accounts");
      
      // Initialize PRIMARY payment (main membership fee)
      const primaryPaystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          amount: Math.round(primaryPrice * 100), // Primary price in kobo/pesewas
          currency: payment.currency || "GHS",
          reference: `${payment.id}_primary`,
          callback_url: `${req.headers.get("origin")}/user/dashboard/payments?payment_id=${payment.id}&type=primary`,
          metadata: {
            payment_id: payment.id,
            membership_id: payment.membership_id,
            user_id: payment.user_id,
            plan_name: payment.memberships?.form_categories?.name,
            payment_type: "primary"
          },
        }),
      });

      const primaryData = await primaryPaystackResponse.json();

      if (!primaryData.status) {
        throw new Error(primaryData.message || "Failed to initialize primary payment");
      }

      // Initialize SECONDARY payment (SMS/LMS add-on)
      const secondaryPaystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secondaryPaystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          amount: Math.round(secondaryPrice * 100), // Secondary price in kobo/pesewas
          currency: payment.currency || "GHS",
          reference: `${payment.id}_secondary`,
          callback_url: `${req.headers.get("origin")}/user/dashboard/payments?payment_id=${payment.id}&type=secondary`,
          metadata: {
            payment_id: payment.id,
            membership_id: payment.membership_id,
            user_id: payment.user_id,
            plan_name: payment.memberships?.form_categories?.secondary_price_label || "SMS/LMS Add-on",
            payment_type: "secondary"
          },
        }),
      });

      const secondaryData = await secondaryPaystackResponse.json();

      if (!secondaryData.status) {
        throw new Error(secondaryData.message || "Failed to initialize secondary payment");
      }

      // Update payment record with both references
      await supabaseClient
        .from("payments")
        .update({ 
          paystack_reference: `${primaryData.data.reference},${secondaryData.data.reference}`,
          amount: totalAmount // Update to total amount
        })
        .eq("id", paymentId);

      // Return BOTH payment URLs - user will complete primary first, then secondary
      return new Response(
        JSON.stringify({
          success: true,
          dual_payment: true,
          primary_authorization_url: primaryData.data.authorization_url,
          secondary_authorization_url: secondaryData.data.authorization_url,
          primary_reference: primaryData.data.reference,
          secondary_reference: secondaryData.data.reference,
          total_amount: totalAmount,
          primary_amount: primaryPrice,
          secondary_amount: secondaryPrice,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Standard single payment flow
      console.log("Processing standard single payment");
      
      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          amount: Math.round(totalAmount * 100), // Total amount in kobo/pesewas
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
        .update({ 
          paystack_reference: paystackData.data.reference,
          amount: totalAmount
        })
        .eq("id", paymentId);

      return new Response(
        JSON.stringify({
          success: true,
          dual_payment: false,
          authorization_url: paystackData.data.authorization_url,
          reference: paystackData.data.reference,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
