import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AboutPage = () => {
  const { settings, isLoading } = useSiteSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const aboutPage = settings.aboutPage;
  const siteName = settings.siteName || "GNACOPS";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-8 text-center">
            {aboutPage.title || `About ${siteName}`}
          </h1>
          
          <div className="space-y-16">
            {/* Introduction Section */}
            {aboutPage.intro && (
              <section className="text-center max-w-4xl mx-auto">
                <p className="text-xl leading-relaxed text-muted-foreground">
                  {aboutPage.intro}
                </p>
              </section>
            )}

            {/* Director Section */}
            {aboutPage.director && (aboutPage.director.name || aboutPage.director.imageUrl) && (
              <section className="bg-gradient-to-br from-card/80 to-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-8 text-accent">Message from the Director</h2>
                <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
                  {/* Director Image */}
                  {aboutPage.director.imageUrl && (
                    <div className="mx-auto lg:mx-0 lg:sticky lg:top-8">
                      <div className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-2xl">
                        <img 
                          src={aboutPage.director.imageUrl} 
                          alt={aboutPage.director.name || "Director"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {aboutPage.director.name && (
                        <div className="text-center mt-4">
                          <h3 className="text-xl font-bold text-foreground">
                            {aboutPage.director.name}
                          </h3>
                          {aboutPage.director.title && (
                            <p className="text-sm font-semibold text-accent mt-1">
                              {aboutPage.director.title}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Director Message */}
                  <div className="space-y-4">
                    {aboutPage.director.bio && (
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                          {aboutPage.director.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Mission & Vision Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {aboutPage.mission && aboutPage.mission.text && (
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-primary mb-4">
                    {aboutPage.mission.title || "Our Mission"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{aboutPage.mission.text}</p>
                </div>
              )}

              {aboutPage.vision && aboutPage.vision.text && (
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-accent mb-4">
                    {aboutPage.vision.title || "Our Vision"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{aboutPage.vision.text}</p>
                </div>
              )}
            </div>

            {/* Values Section */}
            {aboutPage.values && aboutPage.values.items && aboutPage.values.items.length > 0 && (
              <section className="bg-card border border-card-border rounded-2xl p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {aboutPage.values.title || "Our Values"}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aboutPage.values.items.map((value: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-foreground leading-relaxed">{value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
