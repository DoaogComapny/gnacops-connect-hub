import { useState } from "react";
import { Settings, Save, Upload, CreditCard, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminSettings = () => {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("GNACOPS");
  const [tagline, setTagline] = useState("Ghana National Association of Council of Private Schools");
  const [aboutText, setAboutText] = useState("GNACOPS is committed to excellence...");
  
  // Payment Gateway Settings
  const [paymentProvider, setPaymentProvider] = useState("paystack");
  const [paymentApiKey, setPaymentApiKey] = useState("");
  const [paymentPublicKey, setPaymentPublicKey] = useState("");
  
  // Web Settings - Landing Page Content
  const [heroTitle, setHeroTitle] = useState("Join Ghana's Private School Council Today");
  const [heroSubtitle, setHeroSubtitle] = useState("Empowering Excellence in Private Education Across Ghana");
  const [aboutSectionTitle, setAboutSectionTitle] = useState("About GNACOPS");
  const [aboutSectionText, setAboutSectionText] = useState("Ghana National Association of Council of Private Schools");
  
  // Membership Pricing
  const [institutionalPrice, setInstitutionalPrice] = useState("500");
  const [teacherPrice, setTeacherPrice] = useState("200");
  const [parentPrice, setParentPrice] = useState("150");
  const [proprietorPrice, setProprietorPrice] = useState("300");
  const [serviceProviderPrice, setServiceProviderPrice] = useState("250");
  const [nonTeachingStaffPrice, setNonTeachingStaffPrice] = useState("150");
  
  // Footer Settings
  const [footerEmail, setFooterEmail] = useState("info@gnacops.org");
  const [footerPhone, setFooterPhone] = useState("+233 XX XXX XXXX");
  const [footerAddress, setFooterAddress] = useState("Accra, Ghana");
  
  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("GNACOPS");

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

      {/* Payment Gateway Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Payment Gateway Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Payment Provider</label>
            <Select value={paymentProvider} onValueChange={setPaymentProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Public Key</label>
            <Input 
              type="text" 
              placeholder="pk_live_xxxxxxxxxxxx"
              value={paymentPublicKey}
              onChange={(e) => setPaymentPublicKey(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Secret Key</label>
            <Input 
              type="password" 
              placeholder="sk_live_xxxxxxxxxxxx"
              value={paymentApiKey}
              onChange={(e) => setPaymentApiKey(e.target.value)}
            />
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Payment Settings
          </Button>
        </div>
      </Card>

      {/* Web Settings - Landing Page Content */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Web Settings - Landing Page</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Hero Title</label>
            <Input 
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Hero Subtitle</label>
            <Input 
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">About Section Title</label>
            <Input 
              value={aboutSectionTitle}
              onChange={(e) => setAboutSectionTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">About Section Text</label>
            <Textarea 
              rows={4}
              value={aboutSectionText}
              onChange={(e) => setAboutSectionText(e.target.value)}
            />
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Content Settings
          </Button>
        </div>
      </Card>

      {/* Membership Pricing Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Membership Pricing (GHS)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Institutional Membership</label>
            <Input 
              type="number" 
              value={institutionalPrice}
              onChange={(e) => setInstitutionalPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Teacher Council</label>
            <Input 
              type="number" 
              value={teacherPrice}
              onChange={(e) => setTeacherPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Parent Council</label>
            <Input 
              type="number" 
              value={parentPrice}
              onChange={(e) => setParentPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Proprietor</label>
            <Input 
              type="number" 
              value={proprietorPrice}
              onChange={(e) => setProprietorPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Service Provider</label>
            <Input 
              type="number" 
              value={serviceProviderPrice}
              onChange={(e) => setServiceProviderPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Non-Teaching Staff</label>
            <Input 
              type="number" 
              value={nonTeachingStaffPrice}
              onChange={(e) => setNonTeachingStaffPrice(e.target.value)}
            />
          </div>
        </div>

        <Button variant="cta" onClick={handleSaveSettings} className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Pricing
        </Button>
      </Card>

      {/* Footer Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Footer Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Contact Email</label>
            <Input 
              type="email" 
              value={footerEmail}
              onChange={(e) => setFooterEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Contact Phone</label>
            <Input 
              type="tel" 
              value={footerPhone}
              onChange={(e) => setFooterPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Address</label>
            <Input 
              value={footerAddress}
              onChange={(e) => setFooterAddress(e.target.value)}
            />
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Footer Settings
          </Button>
        </div>
      </Card>

      {/* SMTP Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">SMTP Email Configuration</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Configure SMTP settings to send automated emails for registration confirmations, password resets, and member notifications.
        </p>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Host</label>
              <Input 
                type="text" 
                placeholder="smtp.gmail.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Port</label>
              <Input 
                type="number" 
                placeholder="587"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">SMTP Username/Email</label>
            <Input 
              type="email" 
              placeholder="noreply@gnacops.org"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">SMTP Password</label>
            <Input 
              type="password" 
              placeholder="••••••••"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From Email Address</label>
              <Input 
                type="email" 
                placeholder="noreply@gnacops.org"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">From Name</label>
              <Input 
                type="text" 
                placeholder="GNACOPS"
                value={smtpFromName}
                onChange={(e) => setSmtpFromName(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> These settings will be used for all automated emails including:
              registration confirmations with GNACOPS ID, password reset emails, and member notifications.
            </p>
          </div>

          <Button variant="cta" onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save SMTP Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
