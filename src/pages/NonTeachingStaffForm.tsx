import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const NonTeachingStaffForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
    residentialAddress: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    schoolName: "",
    position: "",
    startDate: "",
    educationalBackground: "",
    workExperience: "",
    gnacopsTraining: "",
    developmentProgram: "",
    digitalAddress: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        .eq('name', 'Non-Teaching Staff')
        .single();
      
      if (!category) throw new Error('Non-Teaching Staff category not found');
      
      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        formData,
        categoryId: category.id,
        categoryName: category.name,
      });
      
      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Check your email for login confirmation. You can now log in and complete payment.",
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
              Non-Teaching Staff <span className="text-gradient-accent">Registration</span>
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Recognition for vital school personnel
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Emergency Contact Name *</Label>
                    <Input required value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} />
                  </div>
                  <div>
                    <Label>Emergency Contact Number *</Label>
                    <Input type="tel" required value={formData.emergencyContactNumber} onChange={(e) => setFormData({...formData, emergencyContactNumber: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-accent">Employment Information</h2>
                
                <div>
                  <Label>Name of School Employed *</Label>
                  <Input required value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
                </div>

                <div>
                  <Label>School Ghana Post Digital Address *</Label>
                  <Input 
                    required 
                    placeholder="e.g., GA-123-4567" 
                    value={formData.digitalAddress || ''} 
                    onChange={(e) => setFormData({...formData, digitalAddress: e.target.value})} 
                  />
                </div>

                <div>
                  <Label>Position Held *</Label>
                  <Select required value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="cook">Cook</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date of Employment *</Label>
                    <Input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <Label>Work Experience (years) *</Label>
                    <Input type="number" required value={formData.workExperience} onChange={(e) => setFormData({...formData, workExperience: e.target.value})} />
                  </div>
                </div>

                <div>
                  <Label>Educational Background *</Label>
                  <Input required value={formData.educationalBackground} onChange={(e) => setFormData({...formData, educationalBackground: e.target.value})} />
                </div>

                <div>
                  <Label>Have you received training from GNACOPS? *</Label>
                  <Select required value={formData.gnacopsTraining} onValueChange={(value) => setFormData({...formData, gnacopsTraining: value})}>
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
                  <Label>Interested in GNACOPS Staff Development Program? *</Label>
                  <Select required value={formData.developmentProgram} onValueChange={(value) => setFormData({...formData, developmentProgram: value})}>
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

export default NonTeachingStaffForm;
