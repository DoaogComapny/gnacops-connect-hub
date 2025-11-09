"use client";

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

  const aboutPage = settings?.aboutPage || {};
  const siteName = settings?.siteName || "GNACOPS";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-8 text-center">{aboutPage.title || `About ${siteName}`}</h1>

          <div className="space-y-16">
            {/* Introduction Section */}
            {aboutPage.intro && (
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
                    {aboutPage.director?.name && (
                      <div className="text-center mt-4">
                        <h3 className="text-xl font-bold text-foreground">{aboutPage.director.name}</h3>
                        {aboutPage.director?.title && (
                          <p className="text-sm font-semibold text-accent mt-1">{aboutPage.director.title}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Director Message with Read More */}
                <div className="space-y-6">
                  <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
                    {/* Trigger first so it behaves reliably with most Collapsible implementations */}
                    <CollapsibleTrigger asChild>
                      <div className="flex justify-end">
                        <Button variant="ghost" className="mt-0 w-full sm:w-auto cursor-pointer" type="button">
                          {isDirectorMessageOpen ? (
                            <>
                              Read Less <ChevronUp className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Read More <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CollapsibleTrigger>

                    <div className="prose prose-invert max-w-none">
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                        <p>
                          At the Ghana National Council of Private Schools (GNACOPS), we believe that private education
                          is not a privilege for the few but a partnership for the nation's collective progress. Over
                          the years, GNACOPS has evolved into the central coordinating and representative body that
                          unites thousands of school proprietors, teachers, parents, and learners under one shared
                          vision — to deliver quality, equitable, and sustainable education for all.
                          {!isDirectorMessageOpen && " ..."}
                        </p>
                      </div>

                      <CollapsibleContent className="mt-4">
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                          <p>
                            Our role goes beyond coordination. We serve as a bridge between the private sector and the
                            state, ensuring that private schools operate within national policy frameworks while
                            enjoying the support, guidance, and representation they need to flourish. Through structured
                            collaboration with the Ministry of Education, NaSIA, GES, NaCCA, NTC, and other key
                            partners, GNACOPS has established a trusted ecosystem that enhances school quality,
                            professional capacity, and institutional compliance across the country. We recognize the
                            immense contributions of private schools — who today account for over 40% of Ghana's
                            educational access — and we are committed to supporting them with innovative policies,
                            financial partnerships, training, and technology that make them sustainable, credible, and
                            globally competitive. The future of education demands transformation. It calls for
                            innovation that bridges learning gaps, leadership that inspires accountability, and
                            collaboration that drives results. That is why GNACOPS continues to invest in research,
                            digital transformation, and policy advocacy — ensuring that private education not only
                            complements the national system but leads the way in redefining excellence. To every school
                            owner, teacher, and partner in this great mission — GNACOPS is your home. Together, we form
                            one united body, one shared voice, and one enduring purpose: to make quality education
                            accessible, relevant, and transformative for every Ghanaian child. Education is our nation's
                            greatest investment. Private education is our strongest ally in making it inclusive,
                            innovative, and future-ready.
                          </p>
                          <div className="mt-6 pt-4 border-t border-card-border">
                            <p className="font-semibold text-foreground">Obenfo Nana Kwasi Gyetuah</p>
                            <p className="text-sm text-muted-foreground">National Executive Director</p>
                            <p className="text-sm text-muted-foreground">
                              Ghana National Council of Private Schools (GNACOPS)
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              </div>
            </section>

            {/* Accordion Sections A-J */}
            <section className="bg-gradient-to-br from-card/80 to-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl hover-glow">
              <h2 className="text-3xl font-bold text-center mb-8 text-accent">More About GNACOPS</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="a" className="border border-card-border rounded-lg px-4 hover-glow mb-4">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    🌍 A. Why Join GNACOPS
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="whitespace-pre-line pt-2">
                      The Ghana National Council of Private Schools (GNACOPS) is the legally recognized coordinating and
                      internal regulatory body for all private pre-tertiary schools in Ghana. Joining GNACOPS means
                      becoming part of a national ecosystem that champions the collective interests of private education
                      institutions while providing the tools, policies, and support needed to thrive in Ghana's evolving
                      education landscape. Private schools contribute over 40% of Ghana's educational access, especially
                      in underserved rural and peri-urban areas. Yet many operate in isolation, lacking representation,
                      training, or sustainable funding. GNACOPS bridges this gap by giving every school from the
                      smallest basic school to the largest private SHS a united, professional, and credible national
                      voice. Membership connects you to: • A strong national advocacy platform influencing education
                      policies at MoE, GES, NaSIA, NTC, and NaCCA levels. • Structured professional development programs
                      that improve school governance, teacher quality, and operational efficiency. • Financial and
                      developmental opportunities through GNACOPS partnerships with local and international donors. • A
                      network of over 14,000 proprietors, 300,000 teachers, and 3.9 million learners driving Ghana's
                      educational transformation. • Legal and compliance guidance to help schools operate safely,
                      ethically, and in line with national standards. Join GNACOPS — where private education unites to
                      influence policy, strengthen schools, and impact lives.
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ... keep all other AccordionItems (B-J) unchanged ... */}

                <AccordionItem value="j" className="border border-card-border rounded-lg px-4 hover-glow mb-4">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    ⚖️ J. Jurisdiction of the Council
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="whitespace-pre-line pt-2">
                      The Ghana National Council of Private Schools (GNACOPS) exercises national coordinating authority
                      over all private pre-tertiary education institutions in Ghana. This jurisdiction ensures that
                      private schools, their management bodies, teachers, and learners operate within a well-structured,
                      compliant, and self-sustaining framework that aligns with the national education policy and
                      regulatory standards. GNACOPS functions as the internal coordinating agency for the private
                      education sector, complementing the external regulatory role of the Ministry of Education (MoE),
                      the Ghana Education Service (GES), and the National Schools Inspectorate Authority (NaSIA). Its
                      jurisdiction extends across every dimension of the private pre-tertiary education ecosystem,
                      encompassing policy coordination, compliance monitoring, stakeholder engagement, and institutional
                      development.
                      {/* (content truncated for brevity) */}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Mission & Vision Carousel */}
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {aboutPage.mission?.text && (
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

                {aboutPage.vision?.text && (
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

            {/* Values Section */}
            {aboutPage.values?.items && aboutPage.values.items.length > 0 && (
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
                  <h2 className="text-3xl font-bold text-foreground">{aboutPage.values.title || "Our Values"}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aboutPage.values.items.map((value: string, index: number) => (
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
