import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Send } from "lucide-react";

const ForgotPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    membershipType: "",
    schoolName: "",
    region: "",
    requestType: "both", // "gnacops_id", "password", or "both"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In production, this would send to backend/staff panel
    toast({
      title: "Request Submitted",
      description: "Your request has been sent to our support team. You'll receive an email within 24 hours.",
    });

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      membershipType: "",
      schoolName: "",
      region: "",
      requestType: "both",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/login" className="inline-flex items-center text-accent hover:text-accent-glow mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Forgot Password?
              </h1>
              <p className="text-muted-foreground">
                Enter your details and we'll help you recover your account
              </p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name as registered"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+233 XX XXX XXXX"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="membershipType">Membership Type</Label>
                <Select
                  value={formData.membershipType}
                  onValueChange={(value) => setFormData({ ...formData, membershipType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institutional">Institutional Membership</SelectItem>
                    <SelectItem value="proprietor">Proprietor</SelectItem>
                    <SelectItem value="teacher">Teacher Council</SelectItem>
                    <SelectItem value="parent">Parent Council</SelectItem>
                    <SelectItem value="service">Service Provider</SelectItem>
                    <SelectItem value="non_teaching">Non-Teaching Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="schoolName">School/Institution Name</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Enter school or institution name"
                />
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                    <SelectItem value="Ashanti">Ashanti</SelectItem>
                    <SelectItem value="Western">Western</SelectItem>
                    <SelectItem value="Eastern">Eastern</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Northern">Northern</SelectItem>
                    <SelectItem value="Upper East">Upper East</SelectItem>
                    <SelectItem value="Upper West">Upper West</SelectItem>
                    <SelectItem value="Volta">Volta</SelectItem>
                    <SelectItem value="Brong Ahafo">Brong Ahafo</SelectItem>
                    <SelectItem value="Bono East">Bono East</SelectItem>
                    <SelectItem value="Ahafo">Ahafo</SelectItem>
                    <SelectItem value="Savannah">Savannah</SelectItem>
                    <SelectItem value="North East">North East</SelectItem>
                    <SelectItem value="Oti">Oti</SelectItem>
                    <SelectItem value="Western North">Western North</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Once we verify your information, we'll send your login details to the email address you provided. Please ensure all information is accurate.
                </p>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Remember your details?{" "}
              <Link to="/login" className="text-accent hover:text-accent-glow transition-colors font-medium">
                Login Here
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPage;
