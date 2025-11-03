import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Hero = () => {
  const { settings } = useSiteSettings();
  
  const title = settings.heroTitle || "Join Ghana's Private School Council Today";
  const subtitle = settings.heroSubtitle || "Empowering Excellence in Private Education Across Ghana";

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0">
        <iframe 
          src='https://my.spline.design/magicalglob-81ZTODTZSoJuYj1avVY4gZA4/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
        />
      </div>

      {/* Gradient Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />

      {/* Hero Content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
            <span className="text-gradient-primary">{title.split(' ').slice(0, 2).join(' ')}</span>
            <br />
            <span className="text-gradient-accent">{title.split(' ').slice(2, 5).join(' ')}</span>
            <br />
            <span className="text-foreground">{title.split(' ').slice(5).join(' ')}</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/membership">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Become a Member Now
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="w-8 h-8 text-accent" />
      </div>
    </section>
  );
};

export default Hero;
