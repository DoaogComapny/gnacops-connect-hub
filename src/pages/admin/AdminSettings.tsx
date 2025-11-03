import { useEffect, useState } from "react";
import { Save, Upload, CreditCard, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickLinksManager from "@/components/admin/QuickLinksManager";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AdminSettings = () => {
  const { settings, updateSettings, isLoading } = useSiteSettings();
  const [localSettings, setLocalSettings] = useState(settings);

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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
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
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </Card>

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

        {/* Membership Tab */}
        <TabsContent value="membership" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Membership Types</h2>
            <div className="space-y-8">
              {['institutional', 'teacher', 'parent', 'proprietor', 'serviceProvider', 'nonTeachingStaff'].map((key) => (
                <div key={key} className="border-b border-border pb-6">
                  <h3 className="font-semibold mb-4 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <Input 
                        value={localSettings.memberships?.[key]?.title || ""}
                        onChange={(e) => {
                          const newMemberships = { ...(localSettings.memberships || {}) };
                          if (!newMemberships[key]) newMemberships[key] = { title: "", description: "", price: "" };
                          newMemberships[key].title = e.target.value;
                          updateSetting('memberships', newMemberships);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea 
                        rows={2}
                        value={localSettings.memberships?.[key]?.description || ""}
                        onChange={(e) => {
                          const newMemberships = { ...(localSettings.memberships || {}) };
                          if (!newMemberships[key]) newMemberships[key] = { title: "", description: "", price: "" };
                          newMemberships[key].description = e.target.value;
                          updateSetting('memberships', newMemberships);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                      <Input 
                        type="number"
                        value={localSettings.memberships?.[key]?.price || ""}
                        onChange={(e) => {
                          const newMemberships = { ...(localSettings.memberships || {}) };
                          if (!newMemberships[key]) newMemberships[key] = { title: "", description: "", price: "" };
                          newMemberships[key].price = e.target.value;
                          updateSetting('memberships', newMemberships);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="cta" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Membership Settings
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
