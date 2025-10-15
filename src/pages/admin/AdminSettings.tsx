import { useState } from "react";
import { Settings, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("GNACOPS");
  const [tagline, setTagline] = useState("Ghana National Association of Council of Private Schools");
  const [aboutText, setAboutText] = useState("GNACOPS is committed to excellence...");

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Manage your site configuration</p>
        </div>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Site Name</label>
            <Input 
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tagline</label>
            <Input 
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">About Text</label>
            <Textarea 
              rows={5}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
            />
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Branding */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Branding</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Favicon
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Institutional Membership Fee (GHS)</label>
            <Input type="number" defaultValue="500" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Individual Membership Fee (GHS)</label>
            <Input type="number" defaultValue="200" />
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Payment Settings
          </Button>
        </div>
      </Card>

      {/* Email Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Admin Email</label>
            <Input type="email" defaultValue="admin@gnacops.org" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Support Email</label>
            <Input type="email" defaultValue="support@gnacops.org" />
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Email Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
