import { FileText, CreditCard, CheckCircle, Award } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Fill Forms",
    description: "Complete your membership registration form with accurate details",
  },
  {
    icon: CreditCard,
    title: "Pay Membership Fee",
    description: "Securely pay your membership fee through our payment gateway",
  },
  {
    icon: CheckCircle,
    title: "Admin Approval",
    description: "Wait for admin review and approval of your application",
  },
  {
    icon: Award,
    title: "Get Certificate",
    description: "Receive your GNACOPS ID and official membership certificate",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It <span className="text-gradient-accent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join GNACOPS in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connection Lines (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative text-center animate-fade-in-up hover-lift"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-glow relative z-10 mb-6 shadow-[0_0_30px_hsl(var(--primary-glow)/0.3)]">
                  <Icon className="w-10 h-10 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Step Number Badge */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm z-20">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
