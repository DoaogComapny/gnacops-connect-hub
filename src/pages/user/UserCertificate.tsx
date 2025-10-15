import { Download, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UserCertificate = () => {
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
            <Badge variant="default" className="mt-2">Available</Badge>
          </div>
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <p className="text-muted-foreground mb-6">
          Your membership certificate is ready for download. This certificate verifies your membership with GNACOPS.
        </p>
        <Button variant="cta" size="lg">
          <Download className="mr-2 h-5 w-5" />
          Download Certificate
        </Button>
      </Card>

      {/* Certificate Preview */}
      <Card className="p-8 hover-card">
        <div className="aspect-[8.5/11] border-4 border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Shield className="h-20 w-20 text-primary mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gradient-primary">GNACOPS</h3>
              <p className="text-lg font-semibold mt-2">Certificate of Membership</p>
              <p className="text-muted-foreground mt-4">This certificate belongs to</p>
              <p className="text-xl font-bold mt-2">John Doe</p>
              <p className="text-muted-foreground mt-4">Member ID: GNACOPS251002</p>
              <p className="text-sm text-muted-foreground mt-6">Valid from: January 2025</p>
            </div>
          </div>
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
