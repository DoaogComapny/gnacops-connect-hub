import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Upper East", "Upper West", "Volta", "Brong Ahafo",
  "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
];

interface FormData {
  [key: string]: any;
  password?: string;
  passwordConfirm?: string;
}

const MultiMembershipForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const selectedMemberships = location.state?.selectedMemberships || [];
  
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [formsData, setFormsData] = useState<{ [key: string]: FormData }>({});
  const [completedForms, setCompletedForms] = useState<string[]>([]);

  useEffect(() => {
    if (selectedMemberships.length === 0) {
      navigate("/home");
    }
  }, [selectedMemberships, navigate]);

  if (selectedMemberships.length === 0) {
    return null;
  }

  const currentMembership = selectedMemberships[currentFormIndex];
  const isLastForm = currentFormIndex === selectedMemberships.length - 1;

  const handleInputChange = (field: string, value: any) => {
    setFormsData(prev => ({
      ...prev,
      [currentMembership]: {
        ...prev[currentMembership],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    setCompletedForms(prev => [...new Set([...prev, currentMembership])]);
    if (!isLastForm) {
      setCurrentFormIndex(currentFormIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFormIndex > 0) {
      setCurrentFormIndex(currentFormIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate password on the last form
    const lastFormData = formsData[currentMembership] || {};
    if (!lastFormData.password || !lastFormData.passwordConfirm) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    if (lastFormData.password !== lastFormData.passwordConfirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (lastFormData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setCompletedForms(prev => [...new Set([...prev, currentMembership])]);
    
    try {
      // Use the first form's email and password for account creation
      const firstMembership = selectedMemberships[0];
      const firstFormData = formsData[firstMembership];
      const fullName = `${firstFormData.title || ''} ${firstFormData.firstName || ''} ${firstFormData.middleName || ''} ${firstFormData.surname || ''}`.trim();
      const email = firstFormData.email;
      const password = lastFormData.password;

      // Get the first membership category
      const { data: category } = await supabase
        .from('form_categories')
        .select('id')
        .eq('name', firstMembership)
        .single();

      if (!category) {
        throw new Error('Membership category not found');
      }

      const { registerUser } = await import("@/utils/registrationHelper");
      
      const result = await registerUser({
        fullName,
        email,
        password,
        formData: {
          ...firstFormData,
          memberships: selectedMemberships,
          allFormsData: formsData,
        },
        categoryId: category.id,
        categoryName: firstMembership,
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
    }
  };

  const renderForm = () => {
    const currentData = formsData[currentMembership] || {};

    // Common fields for all forms
    const commonFields = (
      <>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-accent">Personal Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Select 
                value={currentData.title}
                onValueChange={(value) => handleInputChange("title", value)}
              >
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
              <Label>First Name</Label>
              <Input
                value={currentData.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input
                value={currentData.middleName || ""}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
                placeholder="Enter middle name"
              />
            </div>
            <div className="space-y-2">
              <Label>Surname</Label>
              <Input
                value={currentData.surname || ""}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                placeholder="Enter surname"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={currentData.dob || ""}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={currentData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+233 XX XXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={currentData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Region</Label>
            <Select 
              value={currentData.region}
              onValueChange={(value) => handleInputChange("region", value)}
            >
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
            <Label>Address</Label>
            <Input
              value={currentData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter your address"
            />
          </div>

          <div className="space-y-2">
            <Label>Ghana Post Digital Address</Label>
            <Input
              value={currentData.digitalAddress || ""}
              onChange={(e) => handleInputChange("digitalAddress", e.target.value)}
              placeholder="e.g., GA-123-4567"
            />
          </div>
        </div>
      </>
    );

    // Membership-specific fields
    const membershipSpecificFields = () => {
      if (currentMembership === "Institutional Membership") {
        return (
          <div className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-accent">Institution Details</h3>
            <div className="space-y-2">
              <Label>Name of Institution</Label>
              <Input
                value={currentData.institutionName || ""}
                onChange={(e) => handleInputChange("institutionName", e.target.value)}
                placeholder="Enter institution name"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RGD Number</Label>
                <Input
                  value={currentData.rgdNumber || ""}
                  onChange={(e) => handleInputChange("rgdNumber", e.target.value)}
                  placeholder="Registration number"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Establishment</Label>
                <Input
                  type="date"
                  value={currentData.dateEstablished || ""}
                  onChange={(e) => handleInputChange("dateEstablished", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      } else if (currentMembership === "Proprietor") {
        return (
          <div className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-accent">Proprietor Details</h3>
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={currentData.schoolName || ""}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                value={currentData.yearsExperience || ""}
                onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                placeholder="Years in education"
              />
            </div>
          </div>
        );
      } else if (currentMembership === "Teacher Council") {
        return (
          <div className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-accent">Teaching Details</h3>
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={currentData.schoolName || ""}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject Specialization</Label>
              <Input
                value={currentData.subject || ""}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Enter subject"
              />
            </div>
          </div>
        );
      } else if (currentMembership === "Parent Council") {
        return (
          <div className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-accent">Parent Details</h3>
            <div className="space-y-2">
              <Label>Child's School</Label>
              <Input
                value={currentData.childSchool || ""}
                onChange={(e) => handleInputChange("childSchool", e.target.value)}
                placeholder="Enter child's school"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Children</Label>
              <Input
                type="number"
                value={currentData.numberOfChildren || ""}
                onChange={(e) => handleInputChange("numberOfChildren", e.target.value)}
                placeholder="Number of children"
              />
            </div>
          </div>
        );
      } else if (currentMembership === "Service Provider") {
        return (
          <div className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-accent">Service Provider Details</h3>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={currentData.companyName || ""}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Services Offered</Label>
              <Input
                value={currentData.services || ""}
                onChange={(e) => handleInputChange("services", e.target.value)}
                placeholder="Describe services"
              />
            </div>
          </div>
        );
      } else if (currentMembership === "Non-Teaching Staff") {
        return (
          <div className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-accent">Employment Details</h3>
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={currentData.schoolName || ""}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label>Position/Role</Label>
              <Input
                value={currentData.position || ""}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="Enter your position"
              />
            </div>
          </div>
        );
      }
      return null;
    };

    // Password fields on last form only
    const passwordFields = isLastForm && (
      <div className="space-y-6 mt-6">
        <h3 className="text-xl font-semibold text-accent">Account Setup</h3>
        <p className="text-muted-foreground">
          Create your login credentials. You'll use these to access your account.
        </p>
        <div className="space-y-2">
          <Label>Password *</Label>
          <Input
            required
            type="password"
            value={currentData.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter password (min 8 characters)"
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label>Confirm Password *</Label>
          <Input
            required
            type="password"
            value={currentData.passwordConfirm || ""}
            onChange={(e) => handleInputChange("passwordConfirm", e.target.value)}
            placeholder="Confirm your password"
            minLength={8}
          />
        </div>
      </div>
    );

    return (
      <>
        {commonFields}
        {membershipSpecificFields()}
        {passwordFields}
      </>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Multi-Membership <span className="text-gradient-accent">Registration</span>
            </h1>
            <p className="text-muted-foreground">
              Complete registration for {selectedMemberships.length} membership{selectedMemberships.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex items-center gap-2 min-w-max">
                {selectedMemberships.map((membership: string, index: number) => (
                  <div key={membership} className="flex items-center">
                    <div className={`flex items-center gap-2 ${
                      index === currentFormIndex 
                        ? "text-accent" 
                        : completedForms.includes(membership)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        index === currentFormIndex
                          ? "bg-accent text-accent-foreground"
                          : completedForms.includes(membership)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {completedForms.includes(membership) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {membership}
                      </span>
                    </div>
                    {index < selectedMemberships.length - 1 && (
                      <div className="w-12 h-0.5 bg-muted mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Form Badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="default" className="text-lg px-4 py-2">
              Currently filling: {currentMembership}
            </Badge>
          </div>

          {/* Form Content */}
          <Card className="p-8 animate-fade-in-up">
            {renderForm()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentFormIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {isLastForm ? (
                <Button
                  type="button"
                  variant="hero"
                  onClick={handleSubmit}
                  className="flex items-center gap-2"
                >
                  Submit All Applications
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="hero"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next Form
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MultiMembershipForm;
