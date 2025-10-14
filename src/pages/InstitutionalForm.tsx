import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const InstitutionalForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
              {[1, 2, 3].map((step) => (
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
            <form className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    Personal Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <select className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                        <option>Mr.</option>
                        <option>Mrs.</option>
                        <option>Ms.</option>
                        <option>Dr.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Middle Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter middle name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Surname</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter surname"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Name of Institution</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Enter institution name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">RGD Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Registration number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Establishment</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Region</label>
                      <select className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="">Select Region</option>
                        <option>Greater Accra</option>
                        <option>Ashanti</option>
                        <option>Western</option>
                        {/* Add all 16 regions */}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">District</label>
                      <select className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="">Select District</option>
                        {/* Districts will populate based on region */}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location/Address</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Enter full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Vision Statement</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Enter vision statement"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mission Statement</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
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
                      {["Pre-school", "Lower Primary", "Upper Primary", "JHS", "SHS"].map((level) => (
                        <div key={level} className="grid grid-cols-4 gap-2">
                          <div className="flex items-center text-sm">{level}</div>
                          <input
                            type="number"
                            className="px-2 py-1 bg-input border border-border rounded text-sm"
                            placeholder="0"
                          />
                          <input
                            type="number"
                            className="px-2 py-1 bg-input border border-border rounded text-sm"
                            placeholder="0"
                          />
                          <input
                            type="number"
                            className="px-2 py-1 bg-input border border-border rounded text-sm"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-4 text-foreground">Staff Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Teaching Staff</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg"
                          placeholder="Number of teachers"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Non-Teaching Staff</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg"
                          placeholder="Number of staff"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Photograph</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-accent-foreground hover:file:bg-accent-glow"
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
                  <Button type="submit" variant="hero" className="flex items-center gap-2">
                    Submit Application
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
