import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  Wrench,
  UserCog,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { isPrimeMembership } from "@/lib/gnacopsId";

const iconMap: Record<string, any> = {
  institutional: Building2,
  proprietor: Briefcase,
  teacher: GraduationCap,
  parent: Users,
  serviceProvider: Wrench,
  nonTeachingStaff: UserCog,
};

const MembershipCards = () => {
  const { settings, isLoading } = useSiteSettings();

  const fallbackMemberships = [
    { icon: Building2, title: "Institutional Membership", description: "For private schools and educational institutions seeking official registration and support.", price: 500, path: "/register/multi-select", category: "Prime Member", key: 'institutional' },
    { icon: Briefcase, title: "Proprietor", description: "For school owners committed to excellence in private education management.", price: 300, path: "/register/multi-select", category: "Prime Member", key: 'proprietor' },
    { icon: GraduationCap, title: "Teacher Council", description: "Professional development and networking opportunities for dedicated educators.", price: 200, path: "/register/multi-select", category: "Associate Member", key: 'teacher' },
    { icon: Users, title: "Parent Council", description: "Active parent involvement in shaping quality education for their children.", price: 150, path: "/register/multi-select", category: "Associate Member", key: 'parent' },
    { icon: Wrench, title: "Service Provider", description: "Partner with GNACOPS schools by offering essential educational services.", price: 250, path: "/register/multi-select", category: "Associate Member", key: 'serviceProvider' },
    { icon: UserCog, title: "Non-Teaching Staff", description: "Recognition and support for vital non-teaching school personnel.", price: 150, path: "/register/multi-select", category: "Associate Member", key: 'nonTeachingStaff' },
  ];

  const membershipTypes = settings.memberships && Object.keys(settings.memberships).length > 0
    ? Object.entries(settings.memberships).map(([key, data]: [string, any]) => ({
        icon: iconMap[key] || Building2,
        title: data.title || key,
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        path: "/register/multi-select",
        category: isPrimeMembership(data.title || key) ? "Prime Member" : "Associate Member",
        key,
      }))
    : fallbackMemberships;

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Loading memberships...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="membership" className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your <span className="text-gradient-accent">Membership</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the membership type that best fits your role in Ghana's private education sector
          </p>
        </div>

        <div className="space-y-12">
          {/* Prime Members Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">
              Prime Members
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {membershipTypes
                .filter((type: any) => type.category === "Prime Member")
                .map((type: any, index: number) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={index}
                      className="bg-card border-card-border hover:border-accent transition-all duration-300 p-6 group animate-fade-in-up hover-lift"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                            <Icon className="w-6 h-6 text-accent" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-foreground">
                            {type.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {type.description}
                          </p>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-2xl font-bold text-accent">
                              GHS ₵{type.price}
                            </span>
                            <span className="text-sm text-muted-foreground">/year</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-4">
                          <Link to={type.path}>
                            <Button variant="cta" className="w-full">
                              Apply Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Associate Members Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">
              Associate Members
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipTypes
                .filter((type: any) => type.category === "Associate Member")
                .map((type: any, index: number) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={index}
                      className="bg-card border-card-border hover:border-accent transition-all duration-300 p-6 group animate-fade-in-up hover-lift"
                      style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                            <Icon className="w-6 h-6 text-accent" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-foreground">
                            {type.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {type.description}
                          </p>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-2xl font-bold text-accent">GHS ₵{type.price}</span>
                            <span className="text-sm text-muted-foreground">/year</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-4">
                          <Link to={type.path}>
                            <Button variant="cta" className="w-full">
                              Apply Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipCards;
