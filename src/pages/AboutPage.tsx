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
          
          <div className="space-y-12">
            {/* Introduction Section */}
            {aboutPage.intro && (
              <section className="text-center max-w-3xl mx-auto">
                <p className="text-xl leading-relaxed text-muted-foreground">
                  {aboutPage.intro}
                </p>
              </section>
            )}

            {/* Director Section */}
            {aboutPage.director && (aboutPage.director.name || aboutPage.director.imageUrl) && (
              <section className="bg-card border border-card-border rounded-xl p-8 md:p-12">
                <div className="grid md:grid-cols-[300px,1fr] gap-8 items-center">
                  {/* Director Image */}
                  {aboutPage.director.imageUrl && (
                    <div className="mx-auto md:mx-0">
                      <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl">
                        <img 
                          src={aboutPage.director.imageUrl} 
                          alt={aboutPage.director.name || "Director"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Director Info */}
                  <div className="space-y-4">
                    {aboutPage.director.name && (
                      <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                          {aboutPage.director.name}
                        </h2>
                        {aboutPage.director.title && (
                          <p className="text-lg font-semibold text-accent">
                            {aboutPage.director.title}
                          </p>
                        )}
                      </div>
                    )}
                    {aboutPage.director.bio && (
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {aboutPage.director.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Mission, Vision, Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutPage.mission && aboutPage.mission.text && (
                <div className="bg-card border border-card-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    {aboutPage.mission.title || "Our Mission"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{aboutPage.mission.text}</p>
                </div>
              )}

              {aboutPage.vision && aboutPage.vision.text && (
                <div className="bg-card border border-card-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover-lift">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    {aboutPage.vision.title || "Our Vision"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{aboutPage.vision.text}</p>
                </div>
              )}

              {aboutPage.values && aboutPage.values.items && aboutPage.values.items.length > 0 && (
                <div className="bg-card border border-card-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover-lift md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-accent mb-4">
                    {aboutPage.values.title || "Our Values"}
                  </h2>
                  <ul className="space-y-3">
                    {aboutPage.values.items.map((value: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="leading-relaxed">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
