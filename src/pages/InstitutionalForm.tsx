import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/utils/registrationHelper";
import { supabase } from "@/integrations/supabase/client";

const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Brong Ahafo",
  "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
];

const InstitutionalForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Personal Info
    title: "",
    firstName: "",
    middleName: "",
    surname: "",
    dob: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
    // Institution Details
    institutionName: "",
    rgdNumber: "",
    dateEstablished: "",
    region: "",
    district: "",
    address: "",
    digitalAddress: "",
    vision: "",
    mission: "",
    // Enrollment & Staff
    enrollmentPreSchool: { boys: 0, girls: 0, total: 0 },
    enrollmentLowerPrimary: { boys: 0, girls: 0, total: 0 },
    enrollmentUpperPrimary: { boys: 0, girls: 0, total: 0 },
    enrollmentJHS: { boys: 0, girls: 0, total: 0 },
    enrollmentSHS: { boys: 0, girls: 0, total: 0 },
    teachingStaff: 0,
    nonTeachingStaff: 0,
  });

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (formData.password !== formData.passwordConfirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get category ID for Institutional Membership
      const { data: categories } = await supabase
        .from('form_categories')
        .select('id')
        .eq('name', 'Institutional Membership')
        .single();

      if (!categories) {
        throw new Error('Membership category not found');
      }

      const fullName = `${formData.title} ${formData.firstName} ${formData.middleName} ${formData.surname}`.trim();

      const result = await registerUser({
        fullName,
        email: formData.email,
        password: formData.password,
        formData: {
          ...formData,
          fullName,
        },
        categoryId: categories.id,
        categoryName: 'Institutional Membership',
      });

      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: `Your GNACOPS ID is: ${result.gnacopsId}. You can now login with your email and password.`,
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-2">
            Institutional <span className="text-gradient-accent">Membership</span>
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Register your institution with GNACOPS
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${
                    step <= currentStep ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      step <= currentStep
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {step === 1 && "Personal Info"}
                    {step === 2 && "Institution Details"}
                    {step === 3 && "Enrollment & Staff"}
                    {step === 4 && "Account Setup"}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-card border border-card-border rounded-lg p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    Personal Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Select value={formData.title} onValueChange={(value) => updateFormData('title', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        required
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Middle Name</Label>
                      <Input
                        value={formData.middleName}
                        onChange={(e) => updateFormData('middleName', e.target.value)}
                        placeholder="Enter middle name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Surname *</Label>
                      <Input
                        required
                        value={formData.surname}
                        onChange={(e) => updateFormData('surname', e.target.value)}
                        placeholder="Enter surname"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        required
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateFormData('dob', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Institution Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    Institution Details
                  </h2>

                  <div className="space-y-2">
                    <Label>Name of Institution *</Label>
                    <Input
                      required
                      value={formData.institutionName}
                      onChange={(e) => updateFormData('institutionName', e.target.value)}
                      placeholder="Enter institution name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>RGD Number *</Label>
                      <Input
                        required
                        value={formData.rgdNumber}
                        onChange={(e) => updateFormData('rgdNumber', e.target.value)}
                        placeholder="Registration number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Establishment *</Label>
                      <Input
                        required
                        type="date"
                        value={formData.dateEstablished}
                        onChange={(e) => updateFormData('dateEstablished', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Region *</Label>
                      <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Input
                        value={formData.district}
                        onChange={(e) => updateFormData('district', e.target.value)}
                        placeholder="Enter district"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location/Address *</Label>
                    <Textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ghana Post Digital Address</Label>
                    <Input
                      value={formData.digitalAddress}
                      onChange={(e) => updateFormData('digitalAddress', e.target.value)}
                      placeholder="e.g., GA-123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vision Statement</Label>
                    <Textarea
                      rows={3}
                      value={formData.vision}
                      onChange={(e) => updateFormData('vision', e.target.value)}
                      placeholder="Enter vision statement"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mission Statement</Label>
                    <Textarea
                      rows={3}
                      value={formData.mission}
                      onChange={(e) => updateFormData('mission', e.target.value)}
                      placeholder="Enter mission statement"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Enrollment & Staff */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    Enrollment & Staff Information
                  </h2>

                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-4 text-foreground">Student Enrollment</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                        <div>Level</div>
                        <div>Boys</div>
                        <div>Girls</div>
                        <div>Total</div>
                      </div>
                      {[
                        { key: 'PreSchool', label: 'Pre-school' },
                        { key: 'LowerPrimary', label: 'Lower Primary' },
                        { key: 'UpperPrimary', label: 'Upper Primary' },
                        { key: 'JHS', label: 'JHS' },
                        { key: 'SHS', label: 'SHS' }
                      ].map(({ key, label }) => (
                        <div key={key} className="grid grid-cols-4 gap-2">
                          <div className="flex items-center text-sm">{label}</div>
                          <Input
                            type="number"
                            min="0"
                            className="text-sm"
                            placeholder="0"
                            onChange={(e) => {
                              const newData = { ...formData[`enrollment${key}`], boys: parseInt(e.target.value) || 0 };
                              newData.total = newData.boys + newData.girls;
                              updateFormData(`enrollment${key}`, newData);
                            }}
                          />
                          <Input
                            type="number"
                            min="0"
                            className="text-sm"
                            placeholder="0"
                            onChange={(e) => {
                              const newData = { ...formData[`enrollment${key}`], girls: parseInt(e.target.value) || 0 };
                              newData.total = newData.boys + newData.girls;
                              updateFormData(`enrollment${key}`, newData);
                            }}
                          />
                          <Input
                            type="number"
                            min="0"
                            disabled
                            className="text-sm bg-input/50"
                            value={formData[`enrollment${key}`].total}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-4 text-foreground">Staff Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Teaching Staff</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.teachingStaff}
                          onChange={(e) => updateFormData('teachingStaff', parseInt(e.target.value) || 0)}
                          placeholder="Number of teachers"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Non-Teaching Staff</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.nonTeachingStaff}
                          onChange={(e) => updateFormData('nonTeachingStaff', parseInt(e.target.value) || 0)}
                          placeholder="Number of staff"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Account Setup */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    Account Setup
                  </h2>
                  <p className="text-muted-foreground">
                    Create your login credentials. You'll use these to access your account.
                  </p>
                  
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      placeholder="Enter password (min 8 characters)"
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password *</Label>
                    <Input
                      required
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={(e) => updateFormData('passwordConfirm', e.target.value)}
                      placeholder="Confirm your password"
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === totalSteps ? (
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="hero"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalForm;