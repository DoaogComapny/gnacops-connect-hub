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

const ParentCouncilForm = () => {
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
    password: "",
    passwordConfirm: "",
    childrenNames: "",
    schoolNames: "",
    grades: "",
    schoolAddress: "",
    whyJoin: "",
    contribution: "",
    ptaExperience: "",
    ptaExperienceDetails: "",
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

    if (formData.password !== formData.passwordConfirm) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure passwords match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { registerUser } = await import("@/utils/registrationHelper");
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data: category } = await supabase
        .from('form_categories')
        .select('id, name')
        .eq('name', 'Parent Council')
        .single();
      
      if (!category) throw new Error('Parent Council category not found');
      
      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        formData,
        categoryId: category.id,
        categoryName: category.name,
      });
      
      if (result.success) {
        const message = result.autoLoginFailed
          ? `Your GNACOPS ID is: ${result.gnacopsId}. Please login with your credentials.`
          : `Your GNACOPS ID is: ${result.gnacopsId}. Redirecting to payment...`;
        
        toast({
          title: "Registration Successful!",
          description: message,
        });
        
        if (result.autoLoginFailed) {
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setTimeout(() => navigate("/user/payments"), 2000);
        }
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
              Parent Council <span className="text-gradient-accent">Membership</span>
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Shape quality education for your children
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Password *</Label>
                    <Input type="password" required minLength={8} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Min 8 characters" />
                  </div>
                  <div>
                    <Label>Confirm Password *</Label>
                    <Input type="password" required value={formData.passwordConfirm} onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})} placeholder="Re-enter password" />
                  </div>
                </div>
              </div>

              {/* Child/Guardian Info */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Child/Guardian Information</h2>
                
                <div>
                  <Label>Name of Child(ren) *</Label>
                  <Input required placeholder="Separate multiple names with commas" value={formData.childrenNames} onChange={(e) => setFormData({...formData, childrenNames: e.target.value})} />
                </div>

                <div>
                  <Label>School Name(s) *</Label>
                  <Input required value={formData.schoolNames} onChange={(e) => setFormData({...formData, schoolNames: e.target.value})} />
                </div>

                <div>
                  <Label>Grade(s) or Class(es) *</Label>
                  <Input required value={formData.grades} onChange={(e) => setFormData({...formData, grades: e.target.value})} />
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
              </div>

              {/* Interest Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Interest Section</h2>
                
                <div>
                  <Label>Why do you want to join the GNACOPS Parent Council? *</Label>
                  <Textarea required value={formData.whyJoin} onChange={(e) => setFormData({...formData, whyJoin: e.target.value})} rows={4} />
                </div>

                <div>
                  <Label>How do you plan to contribute to the Council's objectives? *</Label>
                  <Textarea required value={formData.contribution} onChange={(e) => setFormData({...formData, contribution: e.target.value})} rows={4} />
                </div>

                <div>
                  <Label>Any experience in PTA or school governance? *</Label>
                  <Select required value={formData.ptaExperience} onValueChange={(value) => setFormData({...formData, ptaExperience: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.ptaExperience === "yes" && (
                  <div>
                    <Label>Please specify experience</Label>
                    <Textarea value={formData.ptaExperienceDetails} onChange={(e) => setFormData({...formData, ptaExperienceDetails: e.target.value})} />
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

export default ParentCouncilForm;
