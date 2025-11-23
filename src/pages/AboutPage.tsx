import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AboutPage = () => {
  const { settings } = useSiteSettings();
  const [isDirectorMessageOpen, setIsDirectorMessageOpen] = useState(false);
  const [isMissionExpanded, setIsMissionExpanded] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);

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
          {aboutPage?.intro && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {aboutPage.intro}
            </p>
          )}
        </div>

        {/* Director's Message */}
        {aboutPage?.director?.bio && (
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
                  <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
                    {(() => {
                      const directorBio = aboutPage.director.bio.trim();
                      const previewText = directorBio.slice(0, 500);
                      const hasMore = directorBio.length > 500;

                      return (
                        <>
                          <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line">
                              {isDirectorMessageOpen ? directorBio : `${previewText}${hasMore ? "..." : ""}`}
                            </p>
                          </div>

                          <CollapsibleContent>
                            {(aboutPage.director.name || aboutPage.director.title) && (
                              <div className="mt-6 pt-4 border-t border-card-border">
                                {aboutPage.director.name && <p className="font-semibold text-foreground">{aboutPage.director.name}</p>}
                                {aboutPage.director.title && (
                                  <p className="text-sm text-muted-foreground">{aboutPage.director.title}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Ghana National Council of Private Schools (GNACOPS)</p>
                              </div>
                            )}
                          </CollapsibleContent>

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
                        </>
                      );
                    })()}
                  </Collapsible>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* More About GNACOPS Accordion Sections */}
        {aboutPage?.detailedSections && aboutPage.detailedSections.filter((section: any) => section?.title && section?.content).length > 0 && (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-accent">More About GNACOPS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full space-y-3">
                {aboutPage.detailedSections
                  .filter((section: any) => section?.title && section?.content)
                  .map((section: any, index: number) => {
                    const isOpen = openAccordionIndex === index;
                    
                    return (
                      <div 
                        key={`accordion-section-${index}`}
                        className="border border-border rounded-lg hover-glow transition-all"
                      >
                        <button
                          onClick={() => setOpenAccordionIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors rounded-lg text-left"
                        >
                          <span className="flex items-center gap-3">
                            {section.emoji && <span className="text-2xl">{section.emoji}</span>}
                            <span className="font-semibold text-lg text-foreground">{section.title}</span>
                          </span>
                          <ChevronDown 
                            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-11">
                              {section.content}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mission, Vision, Values Grid */}
        {(aboutPage?.mission?.text || aboutPage?.vision?.text || aboutPage?.values?.items?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Our Mission with Read More */}
            {aboutPage?.mission?.text && (
              <Card className="hover-glow">
                <CardHeader>
                  <CardTitle className="text-2xl text-accent">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible open={isMissionExpanded} onOpenChange={setIsMissionExpanded}>
                    {(() => {
                      const missionText = aboutPage.mission.text.trim();
                      const previewText = missionText.slice(0, 200);
                      const hasMore = missionText.length > 200;

                      return (
                        <>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {isMissionExpanded ? missionText : `${previewText}${hasMore ? "..." : ""}`}
                          </p>

                          {hasMore && (
                            <CollapsibleContent />
                          )}

                          {hasMore && (
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="mt-4 w-full sm:w-auto hover-glow gap-2">
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
                            </CollapsibleTrigger>
                          )}
                        </>
                      );
                    })()}
                  </Collapsible>
                </CardContent>
              </Card>
            )}

            {/* Our Vision */}
            {aboutPage?.vision?.text && (
              <Card className="hover-glow">
                <CardHeader>
                  <CardTitle className="text-2xl text-accent">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {aboutPage.vision.text}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Our Values */}
            {aboutPage?.values?.items?.length > 0 && (
              <Card className="hover-glow">
                <CardHeader>
                  <CardTitle className="text-2xl text-accent">Our Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {aboutPage.values.items.join(", ")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
