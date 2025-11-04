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
            <Badge variant="secondary" className="mt-2">Not Available</Badge>
          </div>
          <Shield className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-6">
          Your certificate will be available once your membership application is approved and payment is completed.
        </p>
        <Button variant="outline" size="lg" disabled>
          <Download className="mr-2 h-5 w-5" />
          Certificate Not Ready
        </Button>
      </Card>

      {/* Certificate Preview */}
      <Card className="p-8 hover-card">
        <div className="aspect-[8.5/11] border-4 border-border rounded-lg bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Shield className="h-20 w-20 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-muted-foreground">Certificate Preview</h3>
              <p className="text-muted-foreground mt-4 max-w-md">
                Your certificate will appear here once your membership is approved and payment is confirmed.
              </p>
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
