import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, Upload, CreditCard, Globe, Mail, Shield, FileText, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => {
  // Site Settings
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [aboutText, setAboutText] = useState("");
  
  // Landing Page Content
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  
  // Payment Gateway Settings
  const [paymentProvider, setPaymentProvider] = useState("paystack");
  const [paymentApiKey, setPaymentApiKey] = useState("");
  const [paymentPublicKey, setPaymentPublicKey] = useState("");
  
  // Page Content
  const [pageContent, setPageContent] = useState<Record<string, any>>({});
  
  // SMTP Settings
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: ''
  });

  // System Settings
  const [autoApproveRegistrations, setAutoApproveRegistrations] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  
  // Certificate Settings
  const [certificatePrefix, setCertificatePrefix] = useState("GNACOPS");
  const [certificateValidityYears, setCertificateValidityYears] = useState(1);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    // Fetch page content
    const { data: content } = await supabase.from('page_content').select('*');
    if (content) {
      const contentMap = content.reduce((acc: Record<string, any>, item) => {
        acc[item.page_key] = item.content;
        return acc;
      }, {});
      setPageContent(contentMap);
      
      // Set state from content
      if (contentMap['site']) {
        setSiteName(contentMap['site'].name || '');
        setTagline(contentMap['site'].tagline || '');
        setAboutText(contentMap['site'].about || '');
      }
      if (contentMap['landing']) {
        setHeroTitle(contentMap['landing'].heroTitle || '');
        setHeroSubtitle(contentMap['landing'].heroSubtitle || '');
      }
    }

    // Fetch SMTP settings
    const { data: smtp } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (smtp) {
      setSmtpConfig({
        host: smtp.host,
        port: smtp.port,
        username: smtp.username,
        password: smtp.password,
        from_email: smtp.from_email,
        from_name: smtp.from_name
      });
    }
  };

  const updatePageContent = async (pageKey: string, content: any) => {
    const { error } = await supabase
      .from('page_content')
      .upsert({ page_key: pageKey, content }, { onConflict: 'page_key' });

    if (error) {
      toast.error('Failed to update content');
      return;
    }

    toast.success('Settings saved successfully!');
    fetchAllSettings();
  };

  const saveSiteSettings = async () => {
    await updatePageContent('site', {
      name: siteName,
      tagline: tagline,
      about: aboutText
    });
  };

  const saveLandingSettings = async () => {
    await updatePageContent('landing', {
      heroTitle: heroTitle,
      heroSubtitle: heroSubtitle
    });
  };

  const saveAboutSettings = async () => {
    await updatePageContent('about', pageContent.about || {});
  };

  const saveContactSettings = async () => {
    await updatePageContent('contact', pageContent.contact || {});
  };

  const saveSMTPSettings = async () => {
    if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password || !smtpConfig.from_email) {
      toast.error('Please fill in all required SMTP fields');
      return;
    }

    const { data: existing } = await supabase
      .from('smtp_settings')
      .select('id')
      .eq('is_active', true)
      .maybeSingle();

    const { error } = existing
      ? await supabase.from('smtp_settings').update(smtpConfig).eq('id', existing.id)
      : await supabase.from('smtp_settings').insert({ ...smtpConfig, is_active: true });

    if (error) {
      toast.error('Failed to save SMTP settings');
      return;
    }

    toast.success('SMTP settings saved successfully');
  };

  const testSMTPConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: smtpConfig.from_email,
          subject: 'GNACOPS SMTP Test',
          html: '<p>This is a test email. Your SMTP configuration is working correctly!</p>'
        }
      });

      if (error) throw error;

      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error: any) {
      toast.error('Failed to send test email: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your site configuration and content</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              System Configuration
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Auto-Approve Registrations</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new membership applications</p>
                </div>
                <Switch 
                  checked={autoApproveRegistrations}
                  onCheckedChange={setAutoApproveRegistrations}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email before accessing dashboard</p>
                </div>
                <Switch 
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable site access for maintenance</p>
                </div>
                <Switch 
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Allow Public Registration</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable new user registrations</p>
                </div>
                <Switch 
                  checked={allowPublicRegistration}
                  onCheckedChange={setAllowPublicRegistration}
                />
              </div>

              <Button variant="cta" onClick={() => toast.success('System settings saved!')}>
                <Save className="mr-2 h-4 w-4" />
                Save System Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Certificate Settings */}
        <TabsContent value="certificates">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Certificate Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Certificate ID Prefix</Label>
                <Input 
                  value={certificatePrefix}
                  onChange={(e) => setCertificatePrefix(e.target.value)}
                  placeholder="e.g., GNACOPS, GNA"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be used as prefix for all certificate IDs (e.g., GNACOPS-2024-001)
                </p>
              </div>

              <div>
                <Label>Certificate Validity (Years)</Label>
                <Input 
                  type="number"
                  value={certificateValidityYears}
                  onChange={(e) => setCertificateValidityYears(Number(e.target.value))}
                  min="1"
                  max="10"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Number of years before certificate needs renewal
                </p>
              </div>

              <Button variant="cta" onClick={() => toast.success('Certificate settings saved!')}>
                <Save className="mr-2 h-4 w-4" />
                Save Certificate Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Notification Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications to users</p>
                </div>
                <Switch 
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div>
                <Label>Admin Notification Email</Label>
                <Input 
                  type="email"
                  value={adminNotificationEmail}
                  onChange={(e) => setAdminNotificationEmail(e.target.value)}
                  placeholder="admin@gnacops.org"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Email address to receive admin notifications
                </p>
              </div>

              <Button variant="cta" onClick={() => toast.success('Notification settings saved!')}>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-accent" />
              General Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Site Name</Label>
                <Input 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="GNACOPS"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Tagline</Label>
                <Input 
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ghana National Association of Council of Private Schools"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">About Text</Label>
                <Textarea 
                  rows={5}
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="GNACOPS is committed to excellence..."
                />
              </div>

              <Button variant="cta" onClick={saveSiteSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Landing Page Settings */}
        <TabsContent value="landing">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Landing Page Content</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Changes here will reflect immediately on the landing page
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Hero Title</Label>
                <Input 
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Join Ghana's Private School Council Today"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Hero Subtitle</Label>
                <Input 
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Empowering Excellence in Private Education Across Ghana"
                />
              </div>

              <Button variant="cta" onClick={saveLandingSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Landing Page
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* About Page Settings */}
        <TabsContent value="about">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">About Page Content</h2>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={pageContent.about?.title || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, title: e.target.value }
                  })}
                  placeholder="About GNACOPS"
                />
              </div>
              <div>
                <Label>Introduction</Label>
                <Textarea
                  value={pageContent.about?.intro || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, intro: e.target.value }
                  })}
                  rows={3}
                  placeholder="The Ghana National Council of Private Schools..."
                />
              </div>
              <div>
                <Label>Mission</Label>
                <Textarea
                  value={pageContent.about?.mission || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, mission: e.target.value }
                  })}
                  rows={3}
                  placeholder="To support, regulate, and elevate the standards..."
                />
              </div>
              <div>
                <Label>Vision</Label>
                <Textarea
                  value={pageContent.about?.vision || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, vision: e.target.value }
                  })}
                  rows={3}
                  placeholder="A thriving private education sector..."
                />
              </div>
              <Button onClick={saveAboutSettings} variant="cta">
                <Save className="mr-2 h-4 w-4" />
                Save About Page
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Contact Page Settings */}
        <TabsContent value="contact">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Page Content</h2>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={pageContent.contact?.title || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, title: e.target.value }
                  })}
                  placeholder="Contact Us"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={pageContent.contact?.email || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, email: e.target.value }
                  })}
                  placeholder="info@gnacops.org"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={pageContent.contact?.phone || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, phone: e.target.value }
                  })}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={pageContent.contact?.address || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, address: e.target.value }
                  })}
                  rows={3}
                  placeholder="Accra, Ghana"
                />
              </div>
              <Button onClick={saveContactSettings} variant="cta">
                <Save className="mr-2 h-4 w-4" />
                Save Contact Page
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Payment Gateway Configuration */}
        <TabsContent value="payment">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Payment Gateway Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Payment Provider</Label>
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
                <Label className="text-sm font-medium mb-2 block">Public Key</Label>
                <Input 
                  type="text" 
                  placeholder="pk_live_xxxxxxxxxxxx"
                  value={paymentPublicKey}
                  onChange={(e) => setPaymentPublicKey(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Secret Key</Label>
                <Input 
                  type="password" 
                  placeholder="sk_live_xxxxxxxxxxxx"
                  value={paymentApiKey}
                  onChange={(e) => setPaymentApiKey(e.target.value)}
                />
              </div>

              <Button variant="cta" onClick={() => toast.success('Payment settings saved')}>
                <Save className="mr-2 h-4 w-4" />
                Save Payment Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="smtp">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">SMTP Configuration</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Configure your SMTP server for sending emails
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host *</Label>
                  <Input
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="mail.yourserver.com"
                  />
                </div>
                <div>
                  <Label>SMTP Port *</Label>
                  <Input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username *</Label>
                  <Input
                    value={smtpConfig.username}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                    placeholder="your-email@domain.com"
                  />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Email *</Label>
                  <Input
                    type="email"
                    value={smtpConfig.from_email}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                    placeholder="noreply@gnacops.org"
                  />
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    value={smtpConfig.from_name}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                    placeholder="GNACOPS"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveSMTPSettings} variant="cta">
                  <Save className="mr-2 h-4 w-4" />
                  Save SMTP Settings
                </Button>
                <Button onClick={testSMTPConnection} variant="outline">
                  Test Connection
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;