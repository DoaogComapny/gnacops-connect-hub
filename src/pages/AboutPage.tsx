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
        {/* Director's Message */}
        {aboutPage?.director && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-accent">Message from the Director</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {aboutPage.director.image && (
                  <img
                    src={aboutPage.director.image}
                    alt={aboutPage.director.name}
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

        {/* Accordion Sections */}
        {aboutPage?.sections && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-accent">More About GNACOPS</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(aboutPage.sections).map(([key, section]: [string, any]) => (
                  <AccordionItem key={key} value={key} className="border-b border-card-border">
                    <AccordionTrigger className="hover:text-accent transition-colors py-4">
                      <span className="flex items-center gap-2">
                        {section.emoji && <span className="text-xl">{section.emoji}</span>}
                        <span className="font-semibold">{section.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-6">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
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
