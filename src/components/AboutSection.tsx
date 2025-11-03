import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AboutSection = () => {
  const [content, setContent] = useState({
    title: "About GNACOPS",
    description: "The Ghana National Council of Private Schools (GNACOPS) is the leading organization dedicated to promoting excellence and standards in private education across Ghana.",
    mission: "To support, regulate, and elevate the standards of private educational institutions throughout Ghana.",
    vision: "A thriving private education sector that contributes significantly to Ghana's educational excellence and national development.",
    values: "Quality, Integrity, Innovation, and Collaboration in fostering exceptional learning environments."
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('page_content')
      .select('content')
      .eq('page_key', 'about')
      .maybeSingle();

    if (data?.content && typeof data.content === 'object' && data.content !== null) {
      const jsonContent = data.content as any;
      setContent({
        title: jsonContent.title || content.title,
        description: jsonContent.intro || content.description,
        mission: jsonContent.mission || content.mission,
        vision: jsonContent.vision || content.vision,
        values: jsonContent.values || content.values
      });
    }
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
