import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AboutPage = () => {
  const { settings, isLoading: loading } = useSiteSettings();
  const [isDirectorMessageOpen, setIsDirectorMessageOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const aboutPage = settings?.aboutPage;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 space-y-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-accent">
            About GNACOPS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The Ghana National Council of Private Schools (GNACOPS) is the leading organization dedicated to promoting excellence and standards in private education across Ghana.
          </p>
        </div>

        {/* Mission, Vision, Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-accent">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {aboutPage?.mission?.text || "To support, regulate, and elevate the standards of private educational institutions throughout Ghana."}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-accent">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {aboutPage?.vision?.text || "A thriving private education sector that contributes significantly to Ghana's educational excellence and national development."}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-accent">Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {aboutPage?.values?.items?.join(", ") || "Quality, Integrity, Innovation, and Collaboration in fostering exceptional learning environments."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Director's Message */}
        {aboutPage?.director && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-accent">Message from the Director</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {aboutPage.director.imageUrl && (
                  <img
                    src={aboutPage.director.imageUrl}
                    alt={aboutPage.director.name || "Director"}
                    className="w-48 h-48 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 space-y-4">
                  {(() => {
                    const directorBio = aboutPage?.director?.bio?.trim() || "";
                    const previewText = directorBio.slice(0, 500);
                    const hasMore = directorBio.length > 500;

                    return (
                      <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line mb-4">
                            {isDirectorMessageOpen ? directorBio : `${previewText}${hasMore ? "..." : ""}`}
                          </p>
                        </div>

                        {hasMore && (
                          <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                            {(aboutPage?.director?.name || aboutPage?.director?.title) && (
                              <div className="mt-6 pt-4 border-t border-card-border">
                                {aboutPage.director.name && <p className="font-semibold text-foreground">{aboutPage.director.name}</p>}
                                {aboutPage.director.title && (
                                  <p className="text-sm text-muted-foreground">{aboutPage.director.title}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Ghana National Council of Private Schools (GNACOPS)</p>
                              </div>
                            )}
                          </CollapsibleContent>
                        )}

                        {hasMore && (
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="mt-4 w-full sm:w-auto justify-center gap-2 hover-glow transition-all">
                              {isDirectorMessageOpen ? (
                                <>
                                  Read Less <ChevronUp className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  Read More <ChevronDown className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </Collapsible>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* More About GNACOPS Accordion Sections */}
        {aboutPage?.detailedSections && aboutPage.detailedSections.length > 0 && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-accent">More About GNACOPS</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {aboutPage.detailedSections.map((section: any, index: number) => (
                  <AccordionItem 
                    key={index} 
                    value={`section-${index}`} 
                    className="border border-card-border rounded-lg px-4 hover-glow"
                  >
                    <AccordionTrigger className="hover:text-accent transition-colors py-4 hover:no-underline">
                      <span className="flex items-center gap-3 text-left">
                        {section.emoji && <span className="text-2xl">{section.emoji}</span>}
                        <span className="font-semibold text-lg">{section.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-11">
                        {section.content}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
