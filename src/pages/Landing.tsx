import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMemberships } from "@/hooks/useMemberships";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";


const Landing = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { memberships } = useMemberships();
  const { settings } = useSiteSettings();
  const showSecondaryPricing = settings?.enableSecondaryPricing || false;
  const [selectedMemberships, setSelectedMemberships] = useState<string[]>([]);

  const handleToggleMembership = (name: string) => {
    setSelectedMemberships((prev) =>
      prev.includes(name)
        ? prev.filter((m) => m !== name)
        : [...prev, name]
    );
  };

  // Calculate total including secondary price when enabled
  const totalPrice = selectedMemberships.reduce((sum, name) => {
    const membership = memberships?.find((m) => m.name === name);
    if (!membership) return sum;
    
    let price = membership.price || 0;
    
    // Add secondary price if enabled and available
    if (showSecondaryPricing && membership.secondary_price && membership.secondary_price_label) {
      price += membership.secondary_price;
    }
    
    return sum + price;
  }, 0);

  const handleProceed = () => {
    if (selectedMemberships.length === 0) return;
    
    navigate("/register/multi-form", { 
      state: { selectedMemberships } 
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutSection />
      
      {/* Membership Selection Section */}
      <section id="membership" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Select Your <span className="text-gradient-accent">Memberships</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              You can register for multiple membership types at once. Select all that apply to you.
            </p>
          </div>

          {/* Prime Members Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Badge variant="default" className="bg-primary">Prime Members</Badge>
            </h3>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex md:grid md:grid-cols-2 gap-6 min-w-max md:min-w-0">
                {memberships && memberships.length > 0 ? (
                  memberships
                    .filter((type) => type.category === "Prime Member")
                    .map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedMemberships.includes(type.name);
                    const hasSecondaryPrice = showSecondaryPricing && type.secondary_price && type.secondary_price_label;
                    const totalMembershipPrice = hasSecondaryPrice 
                      ? type.price + (type.secondary_price || 0)
                      : type.price;
                    
                    return (
                      <Card
                        key={type.id}
                        className={`flex-shrink-0 w-[320px] md:w-auto p-6 cursor-pointer transition-all duration-300 hover-lift ${
                          isSelected
                            ? "border-accent bg-accent/10"
                            : "bg-card border-card-border hover:border-accent/50"
                        }`}
                        onClick={() => handleToggleMembership(type.name)}
                      >
                        <div className="flex gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMembership(type.name)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-accent" />
                                </div>
                                <h4 className="text-lg font-semibold">{type.name}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-bold text-accent">GHS ₵{type.price}</span>
                                <span className="text-xs text-muted-foreground block">/year</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                              {type.description}
                            </p>
                            
                            {/* Secondary Pricing Display */}
                            {hasSecondaryPrice && (
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {type.secondary_price_label}
                                  </span>
                                  <span className="text-lg font-bold text-accent">
                                    GHS ₵{type.secondary_price}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-accent/30">
                                  <span className="text-xs font-medium text-foreground">Total:</span>
                                  <span className="text-xl font-bold text-accent">
                                    GHS ₵{totalMembershipPrice}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No memberships available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Associate Members Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Badge variant="secondary">Associate Members</Badge>
            </h3>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex md:grid md:grid-cols-2 gap-6 min-w-max md:min-w-0">
                {memberships && memberships.length > 0 ? (
                  memberships
                    .filter((type) => type.category === "Associate Member")
                    .map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedMemberships.includes(type.name);
                    const hasSecondaryPrice = showSecondaryPricing && type.secondary_price && type.secondary_price_label;
                    const totalMembershipPrice = hasSecondaryPrice 
                      ? type.price + (type.secondary_price || 0)
                      : type.price;
                    
                    return (
                      <Card
                        key={type.id}
                        className={`flex-shrink-0 w-[320px] md:w-auto p-6 cursor-pointer transition-all duration-300 hover-lift ${
                          isSelected
                            ? "border-accent bg-accent/10"
                            : "bg-card border-card-border hover:border-accent/50"
                        }`}
                        onClick={() => handleToggleMembership(type.name)}
                      >
                        <div className="flex gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMembership(type.name)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-accent" />
                                </div>
                                <h4 className="text-lg font-semibold">{type.name}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-bold text-accent">GHS ₵{type.price}</span>
                                <span className="text-xs text-muted-foreground block">/year</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                              {type.description}
                            </p>
                            
                            {/* Secondary Pricing Display */}
                            {hasSecondaryPrice && (
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {type.secondary_price_label}
                                  </span>
                                  <span className="text-lg font-bold text-accent">
                                    GHS ₵{type.secondary_price}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-accent/30">
                                  <span className="text-xs font-medium text-foreground">Total:</span>
                                  <span className="text-xl font-bold text-accent">
                                    GHS ₵{totalMembershipPrice}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No memberships available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          {selectedMemberships.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedMemberships.length} Membership{selectedMemberships.length > 1 ? "s" : ""} Selected
                  </h3>
                  <p className="text-muted-foreground">
                    Total: <span className="text-2xl font-bold text-accent">GHS ₵{totalPrice}</span> /year
                  </p>
                </div>
                <Button variant="cta" size="lg" onClick={handleProceed}>
                  Proceed to Registration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Landing;
