import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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
      .select("id, certificate_url")
      .eq("membership_id", membershipId)
      .single();

    if (existingCert && existingCert.certificate_url) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Certificate already exists", 
          certificateId: existingCert.id,
          certificateUrl: existingCert.certificate_url
        }),
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
    
    const fullName = profileData?.full_name || "Member";
    const gnacopsId = membership.gnacops_id;
    const membershipType = categoryData?.name || "Member";

    // Get certificate template from storage
    // First, try to get it from site-assets bucket (where admin might upload it)
    let templateImageBytes: Uint8Array | null = null;
    let templateImageUrl = Deno.env.get("CERTIFICATE_TEMPLATE_URL");
    
    // If no URL is set, try to get from storage
    if (!templateImageUrl) {
      // Try to download from site-assets bucket
      const { data: templateData, error: templateError } = await supabaseClient.storage
        .from("site-assets")
        .download("certificate-template.jpg");
      
      if (!templateError && templateData) {
        templateImageBytes = new Uint8Array(await templateData.arrayBuffer());
      } else {
        // Fallback: use a default template or create one
        console.log("Template not found in storage, using default");
      }
    } else {
      // Download template from URL
      const templateResponse = await fetch(templateImageUrl);
      if (templateResponse.ok) {
        templateImageBytes = new Uint8Array(await templateResponse.arrayBuffer());
      }
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // If we have a template image, embed it
    if (templateImageBytes) {
      let templateImage;
      try {
        // Try to embed as JPEG
        templateImage = await pdfDoc.embedJpg(templateImageBytes);
      } catch {
        try {
          // Try as PNG if JPEG fails
          templateImage = await pdfDoc.embedPng(templateImageBytes);
        } catch {
          console.log("Could not embed template image, creating blank certificate");
          templateImage = null;
        }
      }

      if (templateImage) {
        // Get template dimensions
        const templateDims = templateImage.scale(1);
        const page = pdfDoc.addPage([templateDims.width, templateDims.height]);
        
        // Draw template as background
        page.drawImage(templateImage, {
          x: 0,
          y: 0,
          width: templateDims.width,
          height: templateDims.height,
        });

        // Add text fields on top of template
        // CONFIGURATION: Adjust these coordinates based on your template design
        // You can set these via environment variables or modify the values below
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        // Helper function to center text
        const getCenteredX = (text: string, fontSize: number, font: any) => {
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          return (templateDims.width - textWidth) / 2;
        };
        
        // Name position - typically in the center-middle area of certificate
        // Adjust these percentages based on your template:
        const nameYPercent = parseFloat(Deno.env.get("CERT_NAME_Y_PERCENT") || "0.55"); // 55% from bottom
        const nameY = templateDims.height * nameYPercent;
        const nameSize = parseFloat(Deno.env.get("CERT_NAME_SIZE") || "28");
        const nameX = getCenteredX(fullName, nameSize, font);
        page.drawText(fullName, {
          x: nameX,
          y: nameY,
          size: nameSize,
          font: font,
          color: rgb(0, 0, 0),
        });

        // GNACOPS ID position - typically below the name
        const idYPercent = parseFloat(Deno.env.get("CERT_ID_Y_PERCENT") || "0.48"); // 48% from bottom
        const idY = templateDims.height * idYPercent;
        const idSize = parseFloat(Deno.env.get("CERT_ID_SIZE") || "18");
        const idText = `GNACOPS ID: ${gnacopsId}`;
        const idX = getCenteredX(idText, idSize, regularFont);
        page.drawText(idText, {
          x: idX,
          y: idY,
          size: idSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });

        // Certificate number - typically bottom left or bottom center
        const certNumY = parseFloat(Deno.env.get("CERT_NUM_Y") || "80");
        const certNumX = parseFloat(Deno.env.get("CERT_NUM_X") || "50");
        const certNumSize = parseFloat(Deno.env.get("CERT_NUM_SIZE") || "12");
        page.drawText(`Certificate No: ${certificateNumber}`, {
          x: certNumX,
          y: certNumY,
          size: certNumSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });

        // Issue date - typically near certificate number
        const dateY = certNumY - 25;
        const dateX = parseFloat(Deno.env.get("CERT_DATE_X") || certNumX.toString());
        const dateSize = parseFloat(Deno.env.get("CERT_DATE_SIZE") || "12");
        page.drawText(`Issued: ${issueDate}`, {
          x: dateX,
          y: dateY,
          size: dateSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      } else {
        // Create a simple certificate if no template
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        page.drawText("CERTIFICATE OF MEMBERSHIP", {
          x: 150,
          y: 700,
          size: 28,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`This is to certify that`, {
          x: 200,
          y: 600,
          size: 14,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(fullName, {
          x: 200,
          y: 550,
          size: 24,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`GNACOPS ID: ${gnacopsId}`, {
          x: 200,
          y: 500,
          size: 16,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`Certificate No: ${certificateNumber}`, {
          x: 200,
          y: 400,
          size: 12,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`Issued: ${issueDate}`, {
          x: 200,
          y: 380,
          size: 12,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      }
    } else {
      // Create a simple certificate if no template
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText("CERTIFICATE OF MEMBERSHIP", {
        x: 150,
        y: 700,
        size: 28,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`This is to certify that`, {
        x: 200,
        y: 600,
        size: 14,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(fullName, {
        x: 200,
        y: 550,
        size: 24,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`GNACOPS ID: ${gnacopsId}`, {
        x: 200,
        y: 500,
        size: 16,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Certificate No: ${certificateNumber}`, {
        x: 200,
        y: 400,
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Issued: ${issueDate}`, {
        x: 200,
        y: 380,
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Upload PDF to storage
    const fileName = `certificates/${membershipId}-${certificateNumber}.pdf`;
    const { error: uploadError } = await supabaseClient.storage
      .from("certificates")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading certificate:", uploadError);
      throw new Error(`Failed to upload certificate: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from("certificates")
      .getPublicUrl(fileName);

    // Insert or update certificate record
    const certificateData = {
      user_id: membership.user_id,
      membership_id: membershipId,
      certificate_url: publicUrl,
      issued_at: new Date().toISOString(),
    };

    let certificate;
    if (existingCert) {
      // Update existing certificate
      const { data: updatedCert, error: updateError } = await supabaseClient
        .from("certificates")
        .update(certificateData)
        .eq("id", existingCert.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating certificate:", updateError);
        throw updateError;
      }
      certificate = updatedCert;
    } else {
      // Insert new certificate
      const { data: newCert, error: certError } = await supabaseClient
        .from("certificates")
        .insert(certificateData)
        .select()
        .single();

      if (certError) {
        console.error("Error creating certificate:", certError);
        throw certError;
      }
      certificate = newCert;
    }

    console.log("Certificate generated:", {
      certificateId: certificate.id,
      certificateNumber,
      memberName: fullName,
      gnacopsId: gnacopsId,
      certificateUrl: publicUrl,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificateId: certificate.id,
        certificateNumber,
        certificateUrl: publicUrl,
        certificateData: {
          full_name: fullName,
          gnacops_id: gnacopsId,
          membership_type: membershipType,
          certificate_number: certificateNumber,
          issue_date: issueDate,
        }
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
