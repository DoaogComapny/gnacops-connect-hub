const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 spotlight-effect">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-gradient-accent">GNACOPS</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The Ghana National Council of Private Schools (GNACOPS) is the leading
            organization dedicated to promoting excellence and standards in private
            education across Ghana.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Our Mission",
              description:
                "To support, regulate, and elevate the standards of private educational institutions throughout Ghana.",
            },
            {
              title: "Our Vision",
              description:
                "A thriving private education sector that contributes significantly to Ghana's educational excellence and national development.",
            },
            {
              title: "Our Values",
              description:
                "Quality, Integrity, Innovation, and Collaboration in fostering exceptional learning environments.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-card border border-card-border rounded-lg p-8 hover:border-primary transition-all duration-300 animate-fade-in-up hover-lift"
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
    </section>
  );
};

export default AboutSection;
