import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const AboutSection = () => {
  const { settings } = useSiteSettings();
  const [isMissionExpanded, setIsMissionExpanded] = useState(false);
  
  const content = {
    title: settings.aboutSectionTitle || "About GNACOPS",
    description: settings.aboutSectionText || "The Ghana National Council of Private Schools (GNACOPS) is the leading organization dedicated to promoting excellence and standards in private education across Ghana.",
    mission: settings.aboutPage?.mission?.text || "To support, regulate, and elevate the standards of private educational institutions throughout Ghana.",
    vision: settings.aboutPage?.vision?.text || "A thriving private education sector that contributes significantly to Ghana's educational excellence and national development.",
    values: settings.aboutPage?.values?.items?.join(", ") || "Quality, Integrity, Innovation, and Collaboration in fostering exceptional learning environments."
  };

  const missionPreview = content.mission.slice(0, 200);
  const showMissionToggle = content.mission.length > 200;

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Our Mission */}
          <div className="bg-card border border-card-border rounded-lg p-8 hover:border-primary transition-all duration-300 hover-glow">
            <h3 className="text-2xl font-semibold mb-4 text-accent">
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {isMissionExpanded ? content.mission : `${missionPreview}${showMissionToggle ? "..." : ""}`}
            </p>
            {showMissionToggle && (
              <Button
                variant="ghost"
                onClick={() => setIsMissionExpanded(!isMissionExpanded)}
                className="mt-4 w-full sm:w-auto hover-glow gap-2"
              >
                {isMissionExpanded ? (
                  <>
                    Read Less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read More <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Our Vision */}
          <div className="bg-card border border-card-border rounded-lg p-8 hover:border-primary transition-all duration-300 hover-glow">
            <h3 className="text-2xl font-semibold mb-4 text-accent">
              Our Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {content.vision}
            </p>
          </div>

          {/* Our Values */}
          <div className="bg-card border border-card-border rounded-lg p-8 hover:border-primary transition-all duration-300 hover-glow">
            <h3 className="text-2xl font-semibold mb-4 text-accent">
              Our Values
            </h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {content.values}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
