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
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            {aboutPage.intro && (
              <p className="text-lg leading-relaxed">
                {aboutPage.intro}
              </p>
            )}

            {aboutPage.mission && (
              <div className="bg-card border border-card-border rounded-lg p-8 my-8">
                <h2 className="text-2xl font-semibold text-accent mb-4">
                  {aboutPage.mission.title || "Our Mission"}
                </h2>
                <p>{aboutPage.mission.text}</p>
              </div>
            )}

            {aboutPage.vision && (
              <div className="bg-card border border-card-border rounded-lg p-8 my-8">
                <h2 className="text-2xl font-semibold text-accent mb-4">
                  {aboutPage.vision.title || "Our Vision"}
                </h2>
                <p>{aboutPage.vision.text}</p>
              </div>
            )}

            {aboutPage.values && aboutPage.values.items && aboutPage.values.items.length > 0 && (
              <div className="bg-card border border-card-border rounded-lg p-8 my-8">
                <h2 className="text-2xl font-semibold text-accent mb-4">
                  {aboutPage.values.title || "Our Values"}
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {aboutPage.values.items.map((value: string, index: number) => (
                    <li key={index}>{value}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
