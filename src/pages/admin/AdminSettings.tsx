import { useState } from "react";
import { Settings, Save, Upload, CreditCard, Globe, Mail, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickLinksManager from "@/components/admin/QuickLinksManager";

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
  
  // Membership Titles
  const [institutionalTitle, setInstitutionalTitle] = useState("Institutional Membership");
  const [teacherTitle, setTeacherTitle] = useState("Teacher Council");
  const [parentTitle, setParentTitle] = useState("Parent Council");
  const [proprietorTitle, setProprietorTitle] = useState("Proprietor");
  const [serviceProviderTitle, setServiceProviderTitle] = useState("Service Provider");
  const [nonTeachingStaffTitle, setNonTeachingStaffTitle] = useState("Non-Teaching Staff");
  
  // Membership Descriptions
  const [institutionalDesc, setInstitutionalDesc] = useState("For private schools and educational institutions seeking official registration and support.");
  const [teacherDesc, setTeacherDesc] = useState("Professional development and networking opportunities for dedicated educators.");
  const [parentDesc, setParentDesc] = useState("Active parent involvement in shaping quality education for their children.");
  const [proprietorDesc, setProprietorDesc] = useState("For school owners committed to excellence in private education management.");
  const [serviceProviderDesc, setServiceProviderDesc] = useState("Partner with GNACOPS schools by offering essential educational services.");
  const [nonTeachingStaffDesc, setNonTeachingStaffDesc] = useState("Recognition and support for vital non-teaching school personnel.");
  
  // How It Works Steps
  const [step1Title, setStep1Title] = useState("Fill Forms");
  const [step1Desc, setStep1Desc] = useState("Complete your membership registration form with accurate details");
  const [step2Title, setStep2Title] = useState("Pay Membership Fee");
  const [step2Desc, setStep2Desc] = useState("Securely pay your membership fee through our payment gateway");
  const [step3Title, setStep3Title] = useState("Admin Approval");
  const [step3Desc, setStep3Desc] = useState("Wait for admin review and approval of your application");
  const [step4Title, setStep4Title] = useState("Get Certificate");
  const [step4Desc, setStep4Desc] = useState("Receive your GNACOPS ID and official membership certificate");
  
  // Footer Settings
  const [footerEmail, setFooterEmail] = useState("info@gnacops.org");
  const [footerPhone, setFooterPhone] = useState("+233 XX XXX XXXX");
  const [footerAddress, setFooterAddress] = useState("Accra, Ghana");
  const [footerQuickLinks, setFooterQuickLinks] = useState([
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Membership", path: "/membership" },
    { label: "Contact", path: "/contact" },
  ]);
  
  // About Page Settings
  const [aboutPageTitle, setAboutPageTitle] = useState("About GNACOPS");
  const [aboutPageIntro, setAboutPageIntro] = useState("The Ghana National Council of Private Schools (GNACOPS) is a premier organization dedicated to supporting and elevating private education standards across Ghana.");
  const [aboutMissionTitle, setAboutMissionTitle] = useState("Our Mission");
  const [aboutMissionText, setAboutMissionText] = useState("To support, regulate, and elevate the standards of private educational institutions throughout Ghana, ensuring quality education for all students.");
  const [aboutVisionTitle, setAboutVisionTitle] = useState("Our Vision");
  const [aboutVisionText, setAboutVisionText] = useState("A thriving private education sector that contributes significantly to Ghana's educational excellence and national development.");
  const [aboutValuesTitle, setAboutValuesTitle] = useState("Our Values");
  const [aboutValuesItems, setAboutValuesItems] = useState([
    "Quality in Education",
    "Integrity and Transparency",
    "Innovation and Excellence",
    "Collaboration and Partnership"
  ]);
  
  // Contact Page Settings
  const [contactPageTitle, setContactPageTitle] = useState("Contact Us");
  const [contactEmail, setContactEmail] = useState("info@gnacops.org");
  const [contactPhone, setContactPhone] = useState("+233 XX XXX XXXX");
  const [contactAddress, setContactAddress] = useState("Accra, Ghana");
  
  // Header/Navbar Settings
  const [navbarLinks, setNavbarLinks] = useState([
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Membership", path: "/membership" },
    { label: "Contact", path: "/contact" },
  ]);
  
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="quicklinks">Quick Links</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="quicklinks">
          <QuickLinksManager />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
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

          {/* Web Settings - Membership Configuration */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Web Settings - Membership Types</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Configure titles, descriptions, and pricing for all membership types displayed on the website.
            </p>
            
            <div className="space-y-8">
              {/* Institutional Membership */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4 text-primary">Institutional Membership (Prime)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={institutionalTitle} onChange={(e) => setInstitutionalTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={institutionalDesc} onChange={(e) => setInstitutionalDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                    <Input type="number" value={institutionalPrice} onChange={(e) => setInstitutionalPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Proprietor */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4 text-primary">Proprietor (Prime)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={proprietorTitle} onChange={(e) => setProprietorTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={proprietorDesc} onChange={(e) => setProprietorDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                    <Input type="number" value={proprietorPrice} onChange={(e) => setProprietorPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Teacher Council */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4 text-secondary">Teacher Council (Associate)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={teacherTitle} onChange={(e) => setTeacherTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={teacherDesc} onChange={(e) => setTeacherDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                    <Input type="number" value={teacherPrice} onChange={(e) => setTeacherPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Parent Council */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4 text-secondary">Parent Council (Associate)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={parentTitle} onChange={(e) => setParentTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={parentDesc} onChange={(e) => setParentDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                    <Input type="number" value={parentPrice} onChange={(e) => setParentPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Service Provider */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4 text-secondary">Service Provider (Associate)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={serviceProviderTitle} onChange={(e) => setServiceProviderTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={serviceProviderDesc} onChange={(e) => setServiceProviderDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                    <Input type="number" value={serviceProviderPrice} onChange={(e) => setServiceProviderPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Non-Teaching Staff */}
              <div className="pb-6">
                <h3 className="font-semibold mb-4 text-secondary">Non-Teaching Staff (Associate)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={nonTeachingStaffTitle} onChange={(e) => setNonTeachingStaffTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={nonTeachingStaffDesc} onChange={(e) => setNonTeachingStaffDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (GHS)</label>
                    <Input type="number" value={nonTeachingStaffPrice} onChange={(e) => setNonTeachingStaffPrice(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="cta" onClick={handleSaveSettings} className="mt-4">
              <Save className="mr-2 h-4 w-4" />
              Save Membership Settings
            </Button>
          </Card>

          {/* Web Settings - How It Works Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Web Settings - How It Works</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Customize the steps shown in the "How It Works" section on the landing page.
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-3">Step 1</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={step1Title} onChange={(e) => setStep1Title(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={step1Desc} onChange={(e) => setStep1Desc(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-3">Step 2</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={step2Title} onChange={(e) => setStep2Title(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={step2Desc} onChange={(e) => setStep2Desc(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-3">Step 3</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={step3Title} onChange={(e) => setStep3Title(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={step3Desc} onChange={(e) => setStep3Desc(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div>
                <h3 className="font-semibold mb-3">Step 4</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input value={step4Title} onChange={(e) => setStep4Title(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea rows={2} value={step4Desc} onChange={(e) => setStep4Desc(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="cta" onClick={handleSaveSettings} className="mt-4">
              <Save className="mr-2 h-4 w-4" />
              Save How It Works Settings
            </Button>
          </Card>

          {/* Header/Navbar Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Header/Navbar Configuration</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Customize navigation links shown in the header/navbar.
            </p>
            <div className="space-y-4">
              {navbarLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Link Label</label>
                    <Input 
                      value={link.label}
                      onChange={(e) => {
                        const newLinks = [...navbarLinks];
                        newLinks[index].label = e.target.value;
                        setNavbarLinks(newLinks);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Link Path</label>
                    <Input 
                      value={link.path}
                      onChange={(e) => {
                        const newLinks = [...navbarLinks];
                        newLinks[index].path = e.target.value;
                        setNavbarLinks(newLinks);
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="cta" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Header Settings
              </Button>
            </div>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Quick Links</label>
                <p className="text-xs text-muted-foreground mb-3">Manage footer quick links</p>
                {footerQuickLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-3 p-3 bg-muted/30 rounded">
                    <div>
                      <Input 
                        placeholder="Link Label"
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...footerQuickLinks];
                          newLinks[index].label = e.target.value;
                          setFooterQuickLinks(newLinks);
                        }}
                      />
                    </div>
                    <div>
                      <Input 
                        placeholder="Link Path"
                        value={link.path}
                        onChange={(e) => {
                          const newLinks = [...footerQuickLinks];
                          newLinks[index].path = e.target.value;
                          setFooterQuickLinks(newLinks);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="cta" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Footer Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          {/* About Page Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">About Page Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title</label>
                <Input value={aboutPageTitle} onChange={(e) => setAboutPageTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Introduction Text</label>
                <Textarea rows={3} value={aboutPageIntro} onChange={(e) => setAboutPageIntro(e.target.value)} />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Mission Section</h3>
                <div className="space-y-3">
                  <Input 
                    placeholder="Mission Title"
                    value={aboutMissionTitle} 
                    onChange={(e) => setAboutMissionTitle(e.target.value)} 
                  />
                  <Textarea 
                    rows={3}
                    placeholder="Mission Text"
                    value={aboutMissionText} 
                    onChange={(e) => setAboutMissionText(e.target.value)} 
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Vision Section</h3>
                <div className="space-y-3">
                  <Input 
                    placeholder="Vision Title"
                    value={aboutVisionTitle} 
                    onChange={(e) => setAboutVisionTitle(e.target.value)} 
                  />
                  <Textarea 
                    rows={3}
                    placeholder="Vision Text"
                    value={aboutVisionText} 
                    onChange={(e) => setAboutVisionText(e.target.value)} 
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Values Section</h3>
                <Input 
                  placeholder="Values Title"
                  value={aboutValuesTitle} 
                  onChange={(e) => setAboutValuesTitle(e.target.value)} 
                  className="mb-3"
                />
                {aboutValuesItems.map((item, index) => (
                  <Input 
                    key={index}
                    placeholder={`Value ${index + 1}`}
                    value={item}
                    onChange={(e) => {
                      const newItems = [...aboutValuesItems];
                      newItems[index] = e.target.value;
                      setAboutValuesItems(newItems);
                    }}
                    className="mb-2"
                  />
                ))}
              </div>
              <Button variant="cta" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save About Page Settings
              </Button>
            </div>
          </Card>

          {/* Contact Page Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Contact Page Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title</label>
                <Input value={contactPageTitle} onChange={(e) => setContactPageTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Email</label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Address</label>
                <Input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
              </div>
              <Button variant="cta" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Contact Page Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;