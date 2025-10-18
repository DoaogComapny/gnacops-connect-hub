import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Bono",
  "Bono East", "Ahafo", "Oti", "Savannah", "North East", "Western North"
];

const ServiceProviderForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    position: "",
    phone: "",
    email: "",
    registrationNumber: "",
    servicesProvided: "",
    durationInBusiness: "",
    companyAddress: "",
    region: "",
    district: "",
    website: "",
    referenceSchools: "",
    partnerNationwide: "",
    advertising: "",
    digitalAddress: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Service Provider Form Data:", formData);
    
    toast({
      title: "Registration Submitted!",
      description: "Your application is pending admin approval. You'll receive login details via email.",
    });
    
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Service Provider <span className="text-gradient-accent">Registration</span>
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Partner with GNACOPS schools
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-lg border border-card-border">
              {/* Company Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Company Information</h2>
                
                <div>
                  <Label>Name of Service Provider / Company *</Label>
                  <Input required value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Person *</Label>
                    <Input required value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
                  </div>
                  <div>
                    <Label>Position *</Label>
                    <Input required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Number *</Label>
                    <Input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Business Registration Number *</Label>
                    <Input required value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} />
                  </div>
                  <div>
                    <Label>Duration in Business (years) *</Label>
                    <Input type="number" required value={formData.durationInBusiness} onChange={(e) => setFormData({...formData, durationInBusiness: e.target.value})} />
                  </div>
                </div>

                <div>
                  <Label>Services Provided *</Label>
                  <Textarea required placeholder="e.g., Cleaning, Security, IT, Supplies, etc." value={formData.servicesProvided} onChange={(e) => setFormData({...formData, servicesProvided: e.target.value})} rows={3} />
                </div>

                <div>
                  <Label>Company Address *</Label>
                  <Input required value={formData.companyAddress} onChange={(e) => setFormData({...formData, companyAddress: e.target.value})} />
                </div>

                <div>
                  <Label>Ghana Post Digital Address *</Label>
                  <Input 
                    required 
                    placeholder="e.g., GA-123-4567" 
                    value={formData.digitalAddress || ''} 
                    onChange={(e) => setFormData({...formData, digitalAddress: e.target.value})} 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Region *</Label>
                    <Select required value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region, i) => (
                          <SelectItem key={i} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>District *</Label>
                    <Input required placeholder="Will auto-populate" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} />
                  </div>
                </div>

                <div>
                  <Label>Website (if any)</Label>
                  <Input type="url" placeholder="https://" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                </div>

                <div>
                  <Label>Reference Schools Currently Serviced</Label>
                  <Textarea placeholder="List schools you currently work with" value={formData.referenceSchools} onChange={(e) => setFormData({...formData, referenceSchools: e.target.value})} rows={3} />
                </div>
              </div>

              {/* Service Interest */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Service Interest</h2>
                
                <div>
                  <Label>Willing to partner with GNACOPS schools nationwide? *</Label>
                  <Select required value={formData.partnerNationwide} onValueChange={(value) => setFormData({...formData, partnerNationwide: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Interested in Advertising via GNACOPS? *</Label>
                  <Select required value={formData.advertising} onValueChange={(value) => setFormData({...formData, advertising: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" variant="cta" className="w-full" size="lg">
                Submit Application
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceProviderForm;
