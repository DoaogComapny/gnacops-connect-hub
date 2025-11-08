import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const AboutSection = () => {
  const { settings } = useSiteSettings();
  
  const content = {
    title: settings.aboutSectionTitle || "About GNACOPS",
    description: settings.aboutSectionText || "The Ghana National Council of Private Schools (GNACOPS) is the leading organization dedicated to promoting excellence and standards in private education across Ghana.",
    mission: settings.aboutPage?.mission?.text || "To support, regulate, and elevate the standards of private educational institutions throughout Ghana.",
    vision: settings.aboutPage?.vision?.text || "A thriving private education sector that contributes significantly to Ghana's educational excellence and national development.",
    values: settings.aboutPage?.values?.items?.join(", ") || "Quality, Integrity, Innovation, and Collaboration in fostering exceptional learning environments."
  };

  return (
    <section id="about" className="py-20 px-4 spotlight-effect">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto" opts={{ loop: true }}>
          <CarouselContent>
            {[
              {
                title: "Our Mission",
                description: content.mission,
              },
              {
                title: "Our Vision",
                description: content.vision,
              },
              {
                title: "Our Values",
                description: content.values,
              },
            ].map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/3">
                <div className="h-full p-2">
                  <div className="bg-card border border-card-border rounded-lg p-8 hover:border-primary transition-all duration-300 hover-glow h-full">
                    <h3 className="text-2xl font-semibold mb-4 text-accent">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hover-glow" />
          <CarouselNext className="hover-glow" />
        </Carousel>
      </div>
    </section>
  );
};

export default AboutSection;
