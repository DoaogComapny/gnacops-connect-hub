import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const AboutPage = () => {
  const { settings, isLoading } = useSiteSettings();
  const [isDirectorMessageOpen, setIsDirectorMessageOpen] = useState(false);

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
          <h1 className="text-5xl font-bold mb-8 text-center">{aboutPage?.title || `About ${siteName}`}</h1>

          <div className="space-y-16">
            {/* Introduction Section */}
            {aboutPage?.intro && (
              <section className="text-center max-w-4xl mx-auto">
                <p className="text-xl leading-relaxed text-muted-foreground">{aboutPage.intro}</p>
              </section>
            )}

            {/* Director Section */}
            <section className="bg-gradient-to-br from-card/80 to-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl hover-glow">
              <h2 className="text-3xl font-bold text-center mb-8 text-accent">
                Message from the National Executive Director
              </h2>
              <div className="grid lg:grid-cols-[300px,1fr] gap-8 items-start">
                {/* Director Image */}
                {aboutPage.director?.imageUrl && (
                  <div className="mx-auto lg:mx-0 lg:sticky lg:top-8">
                    <div className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-2xl hover-glow">
                      <img
                        src={aboutPage.director.imageUrl}
                        alt={aboutPage.director.name || "Director"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {aboutPage.director.name && (
                      <div className="text-center mt-4">
                        <h3 className="text-xl font-bold text-foreground">{aboutPage.director.name}</h3>
                        {aboutPage.director.title && (
                          <p className="text-sm font-semibold text-accent mt-1">{aboutPage.director.title}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line">
                        {(() => {
                          const directorBio = aboutPage?.director?.bio?.trim();
                          if (directorBio) {
                            const preview = directorBio.slice(0, 500);
                            return (
                              <>
                                <p className="mb-4">
                                  {isDirectorMessageOpen
                                    ? directorBio
                                    : `${preview}${directorBio.length > 500 ? "..." : ""}`}
                                </p>
                                {directorBio.length > 500 && (
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-center gap-2 hover-glow transition-all duration-300"
                                    >
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
                          }
                          return (
                            <p>
                              At the Ghana National Council of Private Schools (GNACOPS), we believe that private
                              education is not a privilege for the few but a partnership for the nation's collective
                              progress. Over the years, GNACOPS has evolved into the central coordinating and
                              representative body that unites thousands of school proprietors, teachers, parents, and
                              learners under one shared vision — to deliver quality, equitable, and sustainable
                              education for all.
                              {!isDirectorMessageOpen && "..."}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                    <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      {aboutPage?.director?.bio && (
                        <div className="text-muted-foreground leading-relaxed text-justify mt-4 space-y-4 whitespace-pre-line">
                          <p>{aboutPage.director.bio}</p>
                          {(aboutPage?.director?.name || aboutPage?.director?.title) && (
                            <div className="mt-6 pt-4 border-t border-card-border">
                              {aboutPage?.director?.name && (
                                <p className="font-semibold text-foreground">{aboutPage.director.name}</p>
                              )}
                              {aboutPage?.director?.title && (
                                <p className="text-sm text-muted-foreground">{aboutPage.director.title}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Ghana National Council of Private Schools (GNACOPS)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CollapsibleContent>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="mt-4 w-full sm:w-auto hover:bg-muted transition-colors"
                        type="button"
                      >
                        {isDirectorMessageOpen ? (
                          <>
                            Read Less <ChevronUp className="ml-2 h-4 w-4 transition-transform" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="ml-2 h-4 w-4 transition-transform" />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-card/80 to-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl hover-glow">
              <h2 className="text-3xl font-bold text-center mb-8 text-accent">More About GNACOPS</h2>
              {Array.isArray(aboutPage?.detailedSections) && aboutPage!.detailedSections!.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {aboutPage!.detailedSections!.map((sec: any, idx: number) => {
                    const key = (sec?.key || String.fromCharCode(65 + idx)).toString();
                    return (
                      <AccordionItem
                        key={key}
                        value={key.toLowerCase()}
                        className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300"
                      >
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                          {sec?.key ? `${sec.key}. ` : ""}
                          {sec?.title || `Section ${key}`}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                          <div className="pt-2 space-y-4 whitespace-pre-line">{sec?.content || ""}</div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="text-center text-muted-foreground">Content coming soon.</div>
              )}
            </section>

            {/* Mission & Vision Carousel */}
            {(aboutPage?.mission?.text || aboutPage?.vision?.text) && (
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {aboutPage?.mission?.text && (
                    <CarouselItem className="md:basis-1/2">
                      <div className="h-full p-2">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover-glow h-full">
                          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                          </div>
                          <h2 className="text-3xl font-bold text-primary mb-4">
                            {aboutPage.mission.title || "Our Mission"}
                          </h2>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {aboutPage.mission.text}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  )}

                  {aboutPage?.vision?.text && (
                    <CarouselItem className="md:basis-1/2">
                      <div className="h-full p-2">
                        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover-glow h-full">
                          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </div>
                          <h2 className="text-3xl font-bold text-accent mb-4">
                            {aboutPage.vision.title || "Our Vision"}
                          </h2>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {aboutPage.vision.text}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious className="hover-glow" />
                <CarouselNext className="hover-glow" />
              </Carousel>
            )}

            {/* Values Section */}
            {(aboutPage?.values?.items?.length ?? 0) > 0 && (
              <section className="bg-card border border-card-border rounded-2xl p-8 md:p-12 hover-glow">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">{aboutPage?.values?.title || "Our Values"}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aboutPage?.values?.items?.map((value: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover-glow"
                    >
                      <svg
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
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
