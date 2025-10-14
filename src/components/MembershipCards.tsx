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

const membershipTypes = [
  {
    icon: Building2,
    title: "Institutional Membership",
    description: "For private schools and educational institutions seeking official registration and support.",
    path: "/register/institutional",
  },
  {
    icon: GraduationCap,
    title: "Teacher Council",
    description: "Professional development and networking opportunities for dedicated educators.",
    path: "/register/teacher",
  },
  {
    icon: Users,
    title: "Parent Council",
    description: "Active parent involvement in shaping quality education for their children.",
    path: "/register/parent",
  },
  {
    icon: Briefcase,
    title: "Proprietor",
    description: "For school owners committed to excellence in private education management.",
    path: "/register/proprietor",
  },
  {
    icon: Wrench,
    title: "Service Provider",
    description: "Partner with GNACOPS schools by offering essential educational services.",
    path: "/register/service-provider",
  },
  {
    icon: UserCog,
    title: "Non-Teaching Staff",
    description: "Recognition and support for vital non-teaching school personnel.",
    path: "/register/non-teaching-staff",
  },
];

const MembershipCards = () => {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membershipTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card
                key={index}
                className="bg-card border-card-border hover:border-accent transition-all duration-300 p-6 group animate-fade-in-up"
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
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-4">
                    <Link to={type.path}>
                      <Button variant="cta" className="w-full">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MembershipCards;
