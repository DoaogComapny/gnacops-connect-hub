import { Download, Shield, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import certificateTemplate from "@/assets/certificates/gnacops-certificate-template.jpg";

interface CertificateData {
  id: string;
  certificate_url: string;
  issued_at: string;
  membership: {
    gnacops_id: string;
    form_categories: {
      name: string;
    };
  };
  profiles: {
    full_name: string;
  };
}

const UserCertificate = () => {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          certificate_url,
          issued_at,
          memberships!inner(
            gnacops_id,
            form_categories(name)
          ),
          profiles!inner(full_name)
        `)
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log("No certificate found yet");
        return;
      }

      if (data) {
        setCertificate(data as any);
      }
    };

    fetchCertificate();
  }, [user]);

  const handleDownload = () => {
    if (!certificate) return;
    
    // Create a canvas to generate the certificate image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = certificateTemplate;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw template
      ctx.drawImage(img, 0, 0);
      
      // Add user details on the certificate
      ctx.font = 'bold 48px Times New Roman';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      // Member name (adjust Y position based on template)
      const memberName = (certificate as any).profiles?.full_name || 'Member';
      ctx.fillText(memberName, canvas.width / 2, canvas.height * 0.45);
      
      // GNACOPS ID
      ctx.font = '24px Arial';
      const gnacopsId = (certificate as any).memberships?.gnacops_id || '';
      ctx.fillText(`ID: ${gnacopsId}`, canvas.width / 2, canvas.height * 0.52);
      
      // Certificate number (bottom right)
      const certNumber = certificate.certificate_url.replace('certificate://', '');
      ctx.font = '20px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(certNumber, canvas.width - 100, canvas.height - 50);
      
      // Issue date (middle bottom)
      const issueDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      ctx.textAlign = 'center';
      ctx.fillText(issueDate, canvas.width / 2, canvas.height - 100);
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `GNACOPS_Certificate_${gnacopsId}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Certificate downloaded successfully!");
        }
      }, 'image/png');
    };
  };

  const hasCertificate = certificate !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Certificate</h1>
        <p className="text-muted-foreground">Download and manage your membership certificate</p>
      </div>

      {/* Certificate Status */}
      <Card className="p-6 hover-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Certificate Status</h2>
            <Badge variant={hasCertificate ? "default" : "secondary"} className="mt-2">
              {hasCertificate ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Available
                </span>
              ) : "Not Available"}
            </Badge>
          </div>
          <Shield className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-6">
          {hasCertificate 
            ? "Your certificate is ready! Click the button below to download it."
            : "Your certificate will be available once your membership application is approved and payment is completed."}
        </p>
        <Button 
          variant={hasCertificate ? "default" : "outline"} 
          size="lg" 
          disabled={!hasCertificate}
          onClick={handleDownload}
        >
          <Download className="mr-2 h-5 w-5" />
          {hasCertificate ? "Download Certificate" : "Certificate Not Ready"}
        </Button>
      </Card>

      {/* Certificate Preview */}
      <Card className="p-8 hover-card">
        <div className="aspect-[8.5/11] border-4 border-border rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden">
          {hasCertificate ? (
            <div className="relative w-full h-full">
              <img 
                src={certificateTemplate} 
                alt="Certificate Template" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center" style={{ marginTop: '35%' }}>
                  <p className="text-2xl md:text-4xl font-bold text-black">
                    {(certificate as any).profiles?.full_name}
                  </p>
                  <p className="text-sm md:text-base text-black mt-2">
                    ID: {(certificate as any).memberships?.gnacops_id}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Shield className="h-20 w-20 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-muted-foreground">Certificate Preview</h3>
                <p className="text-muted-foreground mt-4 max-w-md">
                  Your certificate will appear here once your membership is approved and payment is confirmed.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Certificate Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Certificate Information</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Digital Certificate</p>
              <p className="text-sm text-muted-foreground">Your certificate is available in PDF format for easy sharing and printing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Verification</p>
              <p className="text-sm text-muted-foreground">Each certificate includes a unique verification code that can be verified on our website.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserCertificate;
