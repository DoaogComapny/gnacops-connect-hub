import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  Wrench,
  UserCog,
  ArrowRight,
} from "lucide-react";
import { isPrimeMembership } from "@/lib/gnacopsId";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const iconMap: Record<string, any> = {
  institutional: Building2,
  proprietor: Briefcase,
  teacher: GraduationCap,
  parent: Users,
  serviceProvider: Wrench,
  nonTeachingStaff: UserCog,
};

const MultiMembershipSelection = () => {
  const navigate = useNavigate();
  const { settings, isLoading } = useSiteSettings();
  const [selectedMemberships, setSelectedMemberships] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex items-center justify-center">
          <p className="text-muted-foreground">Loading memberships...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const fallbackMemberships = [
    { icon: Building2, title: "Institutional Membership", description: "For private schools and educational institutions seeking official registration and support.", price: 500, category: "Prime Member", key: 'institutional' },
    { icon: Briefcase, title: "Proprietor", description: "For school owners committed to excellence in private education management.", price: 300, category: "Prime Member", key: 'proprietor' },
    { icon: GraduationCap, title: "Teacher Council", description: "Professional development and networking opportunities for dedicated educators.", price: 200, category: "Associate Member", key: 'teacher' },
    { icon: Users, title: "Parent Council", description: "Active parent involvement in shaping quality education for their children.", price: 150, category: "Associate Member", key: 'parent' },
    { icon: Wrench, title: "Service Provider", description: "Partner with GNACOPS schools by offering essential educational services.", price: 250, category: "Associate Member", key: 'serviceProvider' },
    { icon: UserCog, title: "Non-Teaching Staff", description: "Recognition and support for vital non-teaching school personnel.", price: 150, category: "Associate Member", key: 'nonTeachingStaff' },
  ];

  const membershipTypes = settings.memberships && Object.keys(settings.memberships).length > 0
    ? Object.entries(settings.memberships).map(([key, data]: [string, any]) => ({
        icon: iconMap[key] || Building2,
        title: data.title || key,
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        category: isPrimeMembership(data.title || key) ? "Prime Member" : "Associate Member",
        key,
      }))
    : fallbackMemberships;

  const handleToggleMembership = (title: string) => {
    setSelectedMemberships((prev) =>
      prev.includes(title)
        ? prev.filter((m) => m !== title)
        : [...prev, title]
    );
  };

  const totalPrice = selectedMemberships.reduce((sum, title) => {
    const membership = membershipTypes.find((m: any) => m.title === title);
    return sum + (membership?.price || 0);
  }, 0);

  const handleProceed = () => {
    if (selectedMemberships.length === 0) return;
    
    // Navigate to multi-form page with selected memberships
    navigate("/register/multi-form", { 
      state: { selectedMemberships } 
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Select Your <span className="text-gradient-accent">Memberships</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              You can register for multiple membership types at once. Select all that apply to you.
            </p>
          </div>

          {/* Prime Members Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Badge variant="default" className="bg-primary">Prime Members</Badge>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {membershipTypes
                .filter((type) => isPrimeMembership(type.title))
                .map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedMemberships.includes(type.title);
                  return (
                    <Card
                      key={type.title}
                      className={`p-6 cursor-pointer transition-all duration-300 hover-lift ${
                        isSelected
                          ? "border-accent bg-accent/10"
                          : "bg-card border-card-border hover:border-accent/50"
                      }`}
                      onClick={() => handleToggleMembership(type.title)}
                    >
                      <div className="flex gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleMembership(type.title)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-accent" />
                              </div>
                              <h3 className="text-lg font-semibold">{type.title}</h3>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-accent">GHS ₵{type.price}</span>
                              <span className="text-xs text-muted-foreground block">/year</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Associate Members Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Badge variant="secondary">Associate Members</Badge>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {membershipTypes
                .filter((type) => !isPrimeMembership(type.title))
                .map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedMemberships.includes(type.title);
                  return (
                    <Card
                      key={type.title}
                      className={`p-6 cursor-pointer transition-all duration-300 hover-lift ${
                        isSelected
                          ? "border-accent bg-accent/10"
                          : "bg-card border-card-border hover:border-accent/50"
                      }`}
                      onClick={() => handleToggleMembership(type.title)}
                    >
                      <div className="flex gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleMembership(type.title)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-accent" />
                              </div>
                              <h3 className="text-lg font-semibold">{type.title}</h3>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-accent">GHS ₵{type.price}</span>
                              <span className="text-xs text-muted-foreground block">/year</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
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
      </div>
      <Footer />
    </div>
  );
};

export default MultiMembershipSelection;
