import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Bono",
  "Bono East", "Ahafo", "Oti", "Savannah", "North East", "Western North"
];

const ProprietorForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    residentialAddress: "",
    schoolName: "",
    schoolType: "",
    schoolAddress: "",
    region: "",
    district: "",
    staffCount: "",
    studentCount: "",
    dateEstablished: "",
    registrationNumber: "",
    gnacopsId: "",
    affiliations: "",
    needSupport: "",
    capacityBuilding: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Proprietor Form Data:", formData);
    
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
              Proprietor <span className="text-gradient-accent">Registration</span>
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Excellence in private education management
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-lg border border-card-border">
              {/* Proprietor Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Proprietor Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select required value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input type="date" required value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                  </div>
                  <div>
                    <Label>Contact Number *</Label>
                    <Input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address *</Label>
                    <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <Label>Residential Address *</Label>
                    <Input required value={formData.residentialAddress} onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* School Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">School Details</h2>
                
                <div>
                  <Label>Name of School *</Label>
                  <Input required value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
                </div>

                <div>
                  <Label>Type of School *</Label>
                  <Select required value={formData.schoolType} onValueChange={(value) => setFormData({...formData, schoolType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creche">Creche</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="jhs">JHS</SelectItem>
                      <SelectItem value="shs">SHS</SelectItem>
                      <SelectItem value="tvet">TVET</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>School Address *</Label>
                  <Input required value={formData.schoolAddress} onChange={(e) => setFormData({...formData, schoolAddress: e.target.value})} />
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Number of Staff Employed *</Label>
                    <Input type="number" required value={formData.staffCount} onChange={(e) => setFormData({...formData, staffCount: e.target.value})} />
                  </div>
                  <div>
                    <Label>Number of Students *</Label>
                    <Input type="number" required value={formData.studentCount} onChange={(e) => setFormData({...formData, studentCount: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date School Was Established *</Label>
                    <Input type="date" required value={formData.dateEstablished} onChange={(e) => setFormData({...formData, dateEstablished: e.target.value})} />
                  </div>
                  <div>
                    <Label>GES/Ministry Registration Number *</Label>
                    <Input required value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} />
                  </div>
                </div>

                <div>
                  <Label>GNACOPS Membership ID (for renewals)</Label>
                  <Input value={formData.gnacopsId} onChange={(e) => setFormData({...formData, gnacopsId: e.target.value})} />
                </div>
              </div>

              {/* Other Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Additional Information</h2>
                
                <div>
                  <Label>Affiliation with Other Educational Bodies? *</Label>
                  <Select required value={formData.affiliations} onValueChange={(value) => setFormData({...formData, affiliations: value})}>
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
                  <Label>Need Support in Accreditation/Certification? *</Label>
                  <Select required value={formData.needSupport} onValueChange={(value) => setFormData({...formData, needSupport: value})}>
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
                  <Label>Interested in GNACOPS Capacity Building Programs? *</Label>
                  <Select required value={formData.capacityBuilding} onValueChange={(value) => setFormData({...formData, capacityBuilding: value})}>
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

export default ProprietorForm;
