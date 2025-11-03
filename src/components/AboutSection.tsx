import { useSiteSettings } from "@/hooks/useSiteSettings";

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

        <div className="overflow-x-auto pb-8 -mx-4 px-4">
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 min-w-max md:min-w-0">
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
              <div
                key={index}
                className="flex-shrink-0 w-[300px] md:w-auto bg-card border border-card-border rounded-lg p-8 hover:border-primary transition-all duration-300 animate-fade-in-up hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-accent">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
