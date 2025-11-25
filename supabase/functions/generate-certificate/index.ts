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

    const { membershipId } = await req.json();

    if (!membershipId) {
      throw new Error("Membership ID is required");
    }

    // Get membership details with user info
    const { data: membership, error: membershipError } = await supabaseClient
      .from("memberships")
      .select(`
        id,
        user_id,
        gnacops_id,
        category_id,
        form_categories(name, type),
        profiles(full_name)
      `)
      .eq("id", membershipId)
      .single();

    if (membershipError || !membership) {
      throw new Error("Membership not found");
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabaseClient
      .from("certificates")
      .select("id")
      .eq("membership_id", membershipId)
      .single();

    if (existingCert) {
      return new Response(
        JSON.stringify({ success: true, message: "Certificate already exists", certificateId: existingCert.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate certificate number (format: CERT-YEAR-XXXXXX)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const certificateNumber = `CERT-${year}-${randomNum}`;

    // Get current date for issuance
    const issueDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const profileData = membership.profiles as any;
    const categoryData = membership.form_categories as any;
    
    // Create certificate data
    const certificateData = {
      full_name: profileData?.full_name || "Member",
      gnacops_id: membership.gnacops_id,
      membership_type: categoryData?.name || "Member",
      certificate_number: certificateNumber,
      issue_date: issueDate,
      valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    // For now, we'll store the certificate data as JSON
    // In a production system, you might want to generate a PDF using a service like Puppeteer
    const certificateUrl = `certificate://${certificateNumber}`;

    // Insert certificate record
    const { data: certificate, error: certError } = await supabaseClient
      .from("certificates")
      .insert({
        user_id: membership.user_id,
        membership_id: membershipId,
        certificate_url: certificateUrl,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (certError) {
      console.error("Error creating certificate:", certError);
      throw certError;
    }

    console.log("Certificate generated:", {
      certificateId: certificate.id,
      certificateNumber,
      memberName: certificateData.full_name,
      gnacopsId: certificateData.gnacops_id,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificateId: certificate.id,
        certificateNumber,
        certificateData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
