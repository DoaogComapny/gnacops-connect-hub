import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Bono",
  "Bono East", "Ahafo", "Oti", "Savannah", "North East", "Western North"
];

const TeacherCouncilForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    region: "",
    district: "",
    residentialAddress: "",
    phone: "",
    email: "",
    schoolName: "",
    schoolAddress: "",
    teachingSubjects: "",
    qualification: "",
    experience: "",
    certifications: "",
    whyJoin: "",
    interests: "",
    professionalDevelopment: "",
    professionalDevelopmentDetails: "",
    agreement: false,
    digitalAddress: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreement) {
      toast({
        title: "Agreement Required",
        description: "Please agree to abide by GNACOPS rules",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { registerUser } = await import("@/utils/registrationHelper");
      
      // Get Teacher Council category
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: category } = await supabase
        .from('form_categories')
        .select('id, name')
        .eq('name', 'Teacher Council')
        .single();
      
      if (!category) throw new Error('Teacher Council category not found');
      
      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        formData,
        categoryId: category.id,
        categoryName: category.name,
      });
      
      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Check your email for login credentials. You can now log in and complete payment.",
        });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Teacher Council <span className="text-gradient-accent">Membership</span>
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Join professional educators across Ghana
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-lg border border-card-border">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Personal Information</h2>
                
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
                    <Label>Nationality *</Label>
                    <Input required value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
                  </div>
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
                  <Label>Residential Address *</Label>
                  <Textarea required value={formData.residentialAddress} onChange={(e) => setFormData({...formData, residentialAddress: e.target.value})} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number *</Label>
                    <Input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Professional Information</h2>
                
                <div>
                  <Label>Current School Name *</Label>
                  <Input required value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
                </div>

                <div>
                  <Label>School Address *</Label>
                  <Input required value={formData.schoolAddress} onChange={(e) => setFormData({...formData, schoolAddress: e.target.value})} />
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

                <div>
                  <Label>Teaching Subject(s) / Grade Level *</Label>
                  <Input required value={formData.teachingSubjects} onChange={(e) => setFormData({...formData, teachingSubjects: e.target.value})} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Highest Academic Qualification *</Label>
                    <Input required value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} />
                  </div>
                  <div>
                    <Label>Teaching Experience (years) *</Label>
                    <Input type="number" required value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                  </div>
                </div>

                <div>
                  <Label>Professional Certifications</Label>
                  <Input value={formData.certifications} onChange={(e) => setFormData({...formData, certifications: e.target.value})} />
                </div>
              </div>

              {/* Interest Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Interest Section</h2>
                
                <div>
                  <Label>Why do you want to join the GNACOPS Teacher Council? *</Label>
                  <Textarea required value={formData.whyJoin} onChange={(e) => setFormData({...formData, whyJoin: e.target.value})} rows={4} />
                </div>

                <div>
                  <Label>What are your key interests or contributions? *</Label>
                  <Textarea required value={formData.interests} onChange={(e) => setFormData({...formData, interests: e.target.value})} rows={4} />
                </div>

                <div>
                  <Label>Professional Development Programs *</Label>
                  <Select required value={formData.professionalDevelopment} onValueChange={(value) => setFormData({...formData, professionalDevelopment: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.professionalDevelopment === "yes" && (
                  <div>
                    <Label>Please specify programs</Label>
                    <Input value={formData.professionalDevelopmentDetails} onChange={(e) => setFormData({...formData, professionalDevelopmentDetails: e.target.value})} />
                  </div>
                )}
              </div>

              {/* Agreement */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Membership Agreement</h2>
                <div className="flex items-start space-x-2">
                  <Checkbox id="agreement" checked={formData.agreement} onCheckedChange={(checked) => setFormData({...formData, agreement: checked as boolean})} />
                  <label htmlFor="agreement" className="text-sm leading-relaxed cursor-pointer">
                    I agree to abide by GNACOPS rules and regulations
                  </label>
                </div>
              </div>

              <Button type="submit" variant="cta" className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherCouncilForm;
