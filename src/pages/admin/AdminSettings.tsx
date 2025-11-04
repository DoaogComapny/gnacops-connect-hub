import { useEffect, useState, useRef } from "react";
import { Save, Upload, CreditCard, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickLinksManager from "@/components/admin/QuickLinksManager";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { settings, updateSettings, isLoading } = useSiteSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...localSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setLocalSettings(newSettings);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'favicon'
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      // Update settings
      const settingKey = type === 'logo' ? 'logoUrl' : 'faviconUrl';
      const newSettings = { ...localSettings, [settingKey]: publicUrl };
      setLocalSettings(newSettings);
      
      // Save immediately
      updateSettings(newSettings);

      // Update favicon in document head if it's a favicon
      if (type === 'favicon') {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = publicUrl;
        }
      }

      toast({
        title: "Success",
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Manage your site configuration</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="quicklinks">Quick Links</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">General Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Site Name</label>
                <Input 
                  value={localSettings.siteName || ""}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tagline</label>
                <Input 
                  value={localSettings.tagline || ""}
                  onChange={(e) => updateSetting('tagline', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Founding Year</label>
                <Input 
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={localSettings.foundingYear || ""}
                  onChange={(e) => updateSetting('foundingYear', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 2010"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to calculate company age in footer (© {new Date().getFullYear()} | Company Age: X Years)
                </p>
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Branding</h2>
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Site Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                    {localSettings.logoUrl ? (
                      <img src={localSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended: PNG or SVG, transparent background
                    </p>
                  </div>
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                    {localSettings.faviconUrl ? (
                      <img src={localSettings.faviconUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Favicon"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      ICO, PNG or SVG. 32x32 or 64x64 pixels recommended
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Landing Page Tab */}
        <TabsContent value="landing" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Hero Section</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Hero Title</label>
                <Input 
                  value={localSettings.heroTitle || ""}
                  onChange={(e) => updateSetting('heroTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Hero Subtitle</label>
                <Input 
                  value={localSettings.heroSubtitle || ""}
                  onChange={(e) => updateSetting('heroSubtitle', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">About Section Title</label>
                <Input 
                  value={localSettings.aboutSectionTitle || ""}
                  onChange={(e) => updateSetting('aboutSectionTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">About Section Text</label>
                <Textarea 
                  rows={4}
                  value={localSettings.aboutSectionText || ""}
                  onChange={(e) => updateSetting('aboutSectionText', e.target.value)}
                />
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Landing Page Settings
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">How It Works Steps</h2>
            <div className="space-y-6">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="border-b border-border pb-4">
                  <h3 className="font-semibold mb-3">Step {idx + 1}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <Input 
                        value={localSettings.howItWorks?.[idx]?.title || ""}
                        onChange={(e) => {
                          const newSteps = [...(localSettings.howItWorks || [])];
                          if (!newSteps[idx]) newSteps[idx] = { title: "", description: "" };
                          newSteps[idx].title = e.target.value;
                          updateSetting('howItWorks', newSteps);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea 
                        rows={2}
                        value={localSettings.howItWorks?.[idx]?.description || ""}
                        onChange={(e) => {
                          const newSteps = [...(localSettings.howItWorks || [])];
                          if (!newSteps[idx]) newSteps[idx] = { title: "", description: "" };
                          newSteps[idx].description = e.target.value;
                          updateSetting('howItWorks', newSteps);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save How It Works
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">About Page</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title</label>
                <Input 
                  value={localSettings.aboutPage?.title || ""}
                  onChange={(e) => updateSetting('aboutPage.title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Introduction</label>
                <Textarea 
                  rows={3}
                  value={localSettings.aboutPage?.intro || ""}
                  onChange={(e) => updateSetting('aboutPage.intro', e.target.value)}
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Mission</h3>
                <Input 
                  placeholder="Mission Title"
                  value={localSettings.aboutPage?.mission?.title || ""}
                  onChange={(e) => updateSetting('aboutPage.mission.title', e.target.value)}
                  className="mb-3"
                />
                <Textarea 
                  rows={3}
                  placeholder="Mission Text"
                  value={localSettings.aboutPage?.mission?.text || ""}
                  onChange={(e) => updateSetting('aboutPage.mission.text', e.target.value)}
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Vision</h3>
                <Input 
                  placeholder="Vision Title"
                  value={localSettings.aboutPage?.vision?.title || ""}
                  onChange={(e) => updateSetting('aboutPage.vision.title', e.target.value)}
                  className="mb-3"
                />
                <Textarea 
                  rows={3}
                  placeholder="Vision Text"
                  value={localSettings.aboutPage?.vision?.text || ""}
                  onChange={(e) => updateSetting('aboutPage.vision.text', e.target.value)}
                />
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save About Page
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Page</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title</label>
                <Input 
                  value={localSettings.contactPage?.title || ""}
                  onChange={(e) => updateSetting('contactPage.title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input 
                  type="email"
                  value={localSettings.contactPage?.email || ""}
                  onChange={(e) => updateSetting('contactPage.email', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input 
                  type="tel"
                  value={localSettings.contactPage?.phone || ""}
                  onChange={(e) => updateSetting('contactPage.phone', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input 
                  value={localSettings.contactPage?.address || ""}
                  onChange={(e) => updateSetting('contactPage.address', e.target.value)}
                />
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Contact Page
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Footer</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Founding Year</label>
                <Input 
                  type="number"
                  value={localSettings.foundingYear || ""}
                  onChange={(e) => updateSetting('foundingYear', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 2020"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Year the organization was established. Used to calculate company age in copyright.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input 
                  type="email"
                  value={localSettings.footer?.email || ""}
                  onChange={(e) => updateSetting('footer.email', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input 
                  type="tel"
                  value={localSettings.footer?.phone || ""}
                  onChange={(e) => updateSetting('footer.phone', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input 
                  value={localSettings.footer?.address || ""}
                  onChange={(e) => updateSetting('footer.address', e.target.value)}
                />
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Footer Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Quick Links Tab */}
        <TabsContent value="quicklinks">
          <QuickLinksManager />
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Payment Gateway</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Input 
                  value="Paystack"
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Public Key</label>
                <Input 
                  value={localSettings.paymentPublicKey || ""}
                  onChange={(e) => updateSetting('paymentPublicKey', e.target.value)}
                  placeholder="pk_live_xxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Secret Key</label>
                <Input 
                  type="password"
                  value={localSettings.paymentApiKey || ""}
                  onChange={(e) => updateSetting('paymentApiKey', e.target.value)}
                  placeholder="sk_live_xxxxxxxxxxxx"
                />
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Payment Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* SMTP Tab */}
        <TabsContent value="smtp" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">SMTP Configuration</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Host</label>
                  <Input 
                    value={localSettings.smtp?.host || ""}
                    onChange={(e) => updateSetting('smtp.host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Port</label>
                  <Input 
                    type="number"
                    value={localSettings.smtp?.port || 587}
                    onChange={(e) => updateSetting('smtp.port', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input 
                  value={localSettings.smtp?.user || ""}
                  onChange={(e) => updateSetting('smtp.user', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input 
                  type="password"
                  value={localSettings.smtp?.password || ""}
                  onChange={(e) => updateSetting('smtp.password', e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Email</label>
                  <Input 
                    type="email"
                    value={localSettings.smtp?.fromEmail || ""}
                    onChange={(e) => updateSetting('smtp.fromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">From Name</label>
                  <Input 
                    value={localSettings.smtp?.fromName || ""}
                    onChange={(e) => updateSetting('smtp.fromName', e.target.value)}
                  />
                </div>
              </div>
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save SMTP Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
