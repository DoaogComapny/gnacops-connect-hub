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

                {/* Director Message with Read More */}
                <div className="space-y-4">
                  <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-muted-foreground leading-relaxed text-justify">
                        <p>
                          At the Ghana National Council of Private Schools (GNACOPS), we believe that private education
                          is not a privilege for the few but a partnership for the nation's collective progress. Over
                          the years, GNACOPS has evolved into the central coordinating and representative body that
                          unites thousands of school proprietors, teachers, parents, and learners under one shared
                          vision — to deliver quality, equitable, and sustainable education for all.
                          {!isDirectorMessageOpen && "..."}
                        </p>
                      </div>
                      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="text-muted-foreground leading-relaxed text-justify mt-4 space-y-4">
                          <p>
                            Our role goes beyond coordination. We serve as a bridge between the private sector and the
                            state, ensuring that private schools operate within national policy frameworks while
                            enjoying the support, guidance, and representation they need to flourish.
                          </p>
                          <p>
                            Through structured collaboration with the Ministry of Education, NaSIA, GES, NaCCA, NTC, and other key
                            partners, GNACOPS has established a trusted ecosystem that enhances school quality,
                            professional capacity, and institutional compliance across the country.
                          </p>
                          <p>
                            We recognize the immense contributions of private schools — who today account for over 40% of Ghana's
                            educational access — and we are committed to supporting them with innovative policies,
                            financial partnerships, training, and technology that make them sustainable, credible, and
                            globally competitive.
                          </p>
                          <p>
                            The future of education demands transformation. It calls for
                            innovation that bridges learning gaps, leadership that inspires accountability, and
                            collaboration that drives results. That is why GNACOPS continues to invest in research,
                            digital transformation, and policy advocacy — ensuring that private education not only
                            complements the national system but leads the way in redefining excellence.
                          </p>
                          <p>
                            To every school owner, teacher, and partner in this great mission — GNACOPS is your home. Together, we form
                            one united body, one shared voice, and one enduring purpose: to make quality education
                            accessible, relevant, and transformative for every Ghanaian child.
                          </p>
                          <p>
                            Education is our nation's greatest investment. Private education is our strongest ally in making it inclusive,
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
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="mt-4 w-full sm:w-auto hover:bg-muted transition-colors" type="button">
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

            {/* Accordion Sections A-J */}
            <section className="bg-gradient-to-br from-card/80 to-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl hover-glow">
              <h2 className="text-3xl font-bold text-center mb-8 text-accent">More About GNACOPS</h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {/* A. Why Join GNACOPS */}
                <AccordionItem value="a" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    🌍 A. Why Join GNACOPS
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        The Ghana National Council of Private Schools (GNACOPS) is the legally recognized coordinating and
                        internal regulatory body for all private pre-tertiary schools in Ghana. Joining GNACOPS means
                        becoming part of a national ecosystem that champions the collective interests of private education
                        institutions while providing the tools, policies, and support needed to thrive in Ghana's evolving
                        education landscape.
                      </p>
                      <p>
                        Private schools contribute over 40% of Ghana's educational access, especially in underserved rural and peri-urban areas. Yet many operate in isolation, lacking representation, training, or sustainable funding. GNACOPS bridges this gap by giving every school — from the smallest basic school to the largest private SHS — a united, professional, and credible national voice.
                      </p>
                      <div>
                        <p className="font-semibold mb-2">Membership connects you to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>A strong national advocacy platform influencing education policies at MoE, GES, NaSIA, NTC, and NaCCA levels.</li>
                          <li>Structured professional development programs that improve school governance, teacher quality, and operational efficiency.</li>
                          <li>Financial and developmental opportunities through GNACOPS partnerships with local and international donors.</li>
                          <li>A network of over 14,000 proprietors, 300,000 teachers, and 3.9 million learners driving Ghana's educational transformation.</li>
                          <li>Legal and compliance guidance to help schools operate safely, ethically, and in line with national standards.</li>
                        </ul>
                      </div>
                      <p className="font-medium text-foreground">
                        Join GNACOPS — where private education unites to influence policy, strengthen schools, and impact lives.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* B. Vision */}
                <AccordionItem value="b" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    🌟 B. Vision
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2">
                      <p>
                        To build a globally competitive, inclusive, and self-sustaining private education system that
                        complements Ghana's national education agenda, empowers communities, and ensures that every child —
                        regardless of location or background — enjoys access to quality learning opportunities.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* C. Mission */}
                <AccordionItem value="c" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    🎯 C. Mission
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>To coordinate, regulate, strengthen, and represent private pre-tertiary schools in Ghana by:</p>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Promoting quality and compliance in all private education institutions.</li>
                        <li>Building capacity and professionalism among teachers, administrators, and proprietors.</li>
                        <li>Facilitating innovation, research, and digital transformation in education delivery.</li>
                        <li>Establishing financially sustainable models that empower private schools to thrive.</li>
                        <li>Advocating for inclusive education policies that protect the interests of learners, parents, and private education providers.</li>
                      </ul>
                      <p className="font-medium text-foreground">
                        Our mission is to ensure that private education remains a trusted, respected, and sustainable pillar of Ghana's national development.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* D. Mandate of the Council */}
                <AccordionItem value="d" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    ⚖️ D. Mandate of the Council
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        The Ghana National Council of Private Schools (GNACOPS) is a legally incorporated national
                        coordinating agency mandated to serve as the official representative and internal coordinating
                        authority for all private pre-tertiary schools in Ghana.
                      </p>
                      <p>
                        GNACOPS operates under the broad policy supervision of the Ministry of Education (MoE) and collaborates with the Ghana Education Service (GES), National Schools Inspectorate Authority (NaSIA), National Teaching Council (NTC), National Council for Curriculum and Assessment (NaCCA), and other relevant stakeholders to ensure alignment between private education and national education standards.
                      </p>
                      <div>
                        <p className="font-semibold mb-2">Our Core Mandate Includes:</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                          <li>
                            <span className="font-medium">Coordination of Private Education:</span> Harmonize the operations of all private pre-tertiary schools in Ghana to ensure consistency with national educational policies and standards.
                          </li>
                          <li>
                            <span className="font-medium">Representation and Advocacy:</span> Serve as the unified national voice for the private education sector — representing school owners, teachers, parents, and learners in national policy discussions and international engagements.
                          </li>
                          <li>
                            <span className="font-medium">Quality Assurance and Compliance Oversight:</span> Work with NaSIA, NTC, and GES to promote quality education delivery, teacher licensing, and adherence to approved curriculum and infrastructure standards.
                          </li>
                          <li>
                            <span className="font-medium">Policy Formulation and Advisory Role:</span> Develop and recommend education policies that strengthen private schools while supporting government's broader education objectives.
                          </li>
                          <li>
                            <span className="font-medium">Research and Innovation Promotion:</span> Conduct sectoral research, promote EduTech integration, and encourage innovative teaching and management practices across private schools.
                          </li>
                          <li>
                            <span className="font-medium">Financial and Institutional Support:</span> Facilitate access to funding, grants, and partnerships that enhance the sustainability of private education institutions.
                          </li>
                          <li>
                            <span className="font-medium">Conflict Resolution and Support Services:</span> Provide mediation, legal guidance, and welfare services for school owners, teachers, and students to maintain stability and harmony in the education ecosystem.
                          </li>
                          <li>
                            <span className="font-medium">Monitoring and Reporting:</span> Track private school compliance with educational policies, ethics, and operational standards, and report findings to relevant authorities for action.
                          </li>
                        </ol>
                      </div>
                      <p className="font-medium text-foreground">
                        In fulfilling this mandate, GNACOPS bridges the gap between regulation and innovation — ensuring that private schools not only comply but also excel.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* E. Brief Profile & Our Purpose */}
                <AccordionItem value="e" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    🏫 E. Brief Profile & Our Purpose
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        The Ghana National Council of Private Schools (GNACOPS) is a legally incorporated, nationwide
                        coordinating agency serving as the formal representation of the private education sector in Ghana.
                      </p>
                      <p>
                        GNACOPS operates under the educational policy framework of the Ministry of Education (MoE) and in
                        collaboration with national regulatory bodies — NaSIA, NTC, NaCCA, to ensure that private schools
                        meet quality standards while addressing their unique operational challenges.
                      </p>
                      <div>
                        <p className="font-semibold mb-2">Our Ecosystem at a Glance</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li><span className="font-medium">14,516+ School Owners & Proprietors</span> – Entrepreneurs who invest private resources in public education outcomes.</li>
                          <li><span className="font-medium">300,000+ Teachers</span> – The second-largest teaching workforce in Ghana, trained and licensed under national standards.</li>
                          <li><span className="font-medium">3.9 Million Learners</span> – Nearly half of Ghana's school-going children enrolled in GNACOPS member institutions.</li>
                          <li><span className="font-medium">567,000+ Parents</span> – Active participants and accountability partners in the private education community.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Our Purpose</p>
                        <p>GNACOPS was established to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                          <li>Coordinate private school operations for effective policy alignment and educational outcomes.</li>
                          <li>Represent the interests of the private sector in national and international education dialogues.</li>
                          <li>Build a unified, transparent, and accountable education ecosystem that complements the public system.</li>
                        </ul>
                      </div>
                      <p className="font-medium text-foreground">
                        Through policy engagement, innovation, and stakeholder collaboration, GNACOPS strengthens private education as a key driver of equitable learning and national growth.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* F. Objectives of the Council */}
                <AccordionItem value="f" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    🎯 F. Objectives of the Council
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        GNACOPS's objectives are guided by its commitment to equity, quality, and accountability in
                        private education. The Council's objectives are both strategic and operational, designed to
                        position private education as a reliable partner in achieving Ghana's Education Strategic Plan
                        (ESP) and the UN Sustainable Development Goal 4 (SDG 4): Quality Education for All.
                      </p>
                      <div>
                        <p className="font-semibold mb-2">Strategic Objectives</p>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                          <li>
                            <span className="font-medium">Policy and Governance:</span> Establish a robust framework for policy development, governance, and accountability in private education institutions.
                          </li>
                          <li>
                            <span className="font-medium">Quality Assurance:</span> Set and enforce quality benchmarks for teaching, learning, school infrastructure, and management practices.
                          </li>
                          <li>
                            <span className="font-medium">Capacity Building:</span> Provide continuous professional development for teachers, administrators, and proprietors to ensure excellence and professionalism.
                          </li>
                          <li>
                            <span className="font-medium">Innovation and Technology Advancement:</span> Encourage the use of ICT, digital learning tools, and innovative teaching methodologies to enhance learning outcomes.
                          </li>
                          <li>
                            <span className="font-medium">Financial Sustainability:</span> Develop sustainable financing models, funding schemes, and partnerships that empower private schools to grow and remain resilient.
                          </li>
                          <li>
                            <span className="font-medium">Advocacy and Support Services:</span> Represent private schools at all policy levels, mediate disputes, and offer legal and operational guidance for schools in distress.
                          </li>
                          <li>
                            <span className="font-medium">Compliance and Accountability:</span> Monitor and report on ethical, operational, and financial practices across private schools, ensuring transparency and good governance.
                          </li>
                          <li>
                            <span className="font-medium">Partnership and Collaboration:</span> Work with government agencies, NGOs, development partners, and the private sector to strengthen educational access and quality nationwide.
                          </li>
                          <li>
                            <span className="font-medium">Equity and Access:</span> Promote inclusive education by supporting private schools serving disadvantaged and rural communities.
                          </li>
                        </ol>
                      </div>
                      <p className="font-medium text-foreground">
                        Through these objectives, GNACOPS seeks to transform private education into a model of excellence — empowering learners, uplifting educators, and contributing to Ghana's socio-economic growth.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* G. Departments and Their Focus */}
                <AccordionItem value="g" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    ⚙️ G. Departments and Their Focus
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        To deliver on its mandate effectively, GNACOPS operates through seven specialized departments,
                        each designed to serve a vital function within the private education framework:
                      </p>
                      <ol className="list-decimal list-inside space-y-4 ml-2">
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Coordination and Policy Development Unit (CPDU)</span>
                            <p className="mt-1">Develops, reviews, and harmonizes policies for private schools. Serves as the liaison between GNACOPS and national education authorities to ensure all private schools align with MoE, NaSIA, and GES regulations.</p>
                          </div>
                        </li>
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Educational Standards and Compliance Unit (ESCU)</span>
                            <p className="mt-1">Oversees accreditation, quality assurance, and teacher licensing in collaboration with NaSIA and NTC. Conducts compliance audits, school inspections, and professional development for educators.</p>
                          </div>
                        </li>
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Financial Sustainability and Developmental Support Unit (FSDSU)</span>
                            <p className="mt-1">Designs and implements financial support mechanisms, including grants, revolving funds, and credit schemes to strengthen the financial resilience of private schools. Promotes financial literacy and sustainable business models for school proprietors.</p>
                          </div>
                        </li>
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Curriculum Standardization and Educational Development Unit (CSEDU)</span>
                            <p className="mt-1">Works closely with NaCCA and GES to align private school curricula with national learning standards. Develops teaching resources, promotes STEM and competency-based education, and delivers teacher training.</p>
                          </div>
                        </li>
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Research, Innovation and Stakeholder Engagement Unit (RISEU)</span>
                            <p className="mt-1">Drives evidence-based decision-making through research and data analytics. Promotes digital transformation, stakeholder partnerships, and the adoption of innovative educational technologies.</p>
                          </div>
                        </li>
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Support Services and Advocacy Unit (SSAU)</span>
                            <p className="mt-1">Provides legal, counseling, and health support to private schools. Handles dispute resolution, promotes school safety, and advocates for teacher and student welfare.</p>
                          </div>
                        </li>
                        <li>
                          <div className="inline-block">
                            <span className="font-medium">Private Education Compliance Unit (PECU)</span>
                            <p className="mt-1">Monitors ethical, operational, and financial integrity across private schools. Investigates malpractice, fraud, and compliance breaches while promoting accountability and transparency.</p>
                          </div>
                        </li>
                      </ol>
                      <p className="font-medium text-foreground">
                        Together, these departments form the backbone of GNACOPS' internal governance — ensuring structure, accountability, and excellence across the private education landscape.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* H. Benefits of Membership */}
                <AccordionItem value="h" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    💼 H. Benefits of Membership
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        Membership with GNACOPS opens the door to growth, credibility, and support for every private
                        education stakeholder.
                      </p>
                      <div>
                        <p className="font-semibold mb-2">For School Owners & Proprietors</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Representation at the Ministry of Education and national policy platforms.</li>
                          <li>Access to GNACOPS financial support programs and donor partnerships.</li>
                          <li>Business advisory, governance, and sustainability support.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">For Teachers</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Access to continuous professional development (CPD) and certification programs.</li>
                          <li>Inclusion in the national teacher licensing system under NTC supervision.</li>
                          <li>Networking and exchange programs with other private educators nationwide.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">For Parents</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>A platform to ensure accountability, transparency, and welfare in private schools.</li>
                          <li>Opportunities to participate in school improvement and scholarship initiatives.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">For Learners</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Access to safe, compliant, and quality learning environments.</li>
                          <li>Opportunities for scholarship, digital learning, and skills-based education.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Institutional & Systemic Benefits</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Integration into Ghana's official education policy framework.</li>
                          <li>Support for data-driven decision-making and school improvement.</li>
                          <li>Advocacy and protection of private education rights.</li>
                        </ul>
                      </div>
                      <p className="font-medium text-foreground">
                        GNACOPS membership is more than affiliation — it is a partnership for progress, integrity, and transformation in Ghana's education system.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* I. Jurisdiction of the Council */}
                <AccordionItem value="i" className="border border-card-border rounded-lg px-4 hover-glow transition-all duration-300">
                  <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline py-4">
                    ⚖️ I. Jurisdiction of the Council
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    <div className="pt-2 space-y-4">
                      <p>
                        The Ghana National Council of Private Schools (GNACOPS) exercises national coordinating authority
                        over all private pre-tertiary education institutions in Ghana.
                      </p>
                      <p>
                        This jurisdiction ensures that private schools, their management bodies, teachers, and learners operate within a well-structured, compliant, and self-sustaining framework that aligns with the national education policy and regulatory standards.
                      </p>
                      <p>
                        GNACOPS functions as the internal coordinating agency for the private education sector, complementing the external regulatory role of the Ministry of Education (MoE), the Ghana Education Service (GES), and the National Schools Inspectorate Authority (NaSIA).
                      </p>
                      <p>
                        Its jurisdiction extends across every dimension of the private pre-tertiary education ecosystem, encompassing policy coordination, compliance monitoring, stakeholder engagement, and institutional development.
                      </p>

                      <div>
                        <p className="font-semibold mb-2">1. Private Pre-Tertiary Schools</p>
                        <p className="mb-2">GNACOPS's authority covers all registered and accredited private institutions within the pre-tertiary level, including:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Private Kindergarten, Primary, and Junior High Schools.</li>
                          <li>Private Senior High Schools, Technical, and Vocational Institutions.</li>
                          <li>Faith-based, community-based, and corporate-owned schools.</li>
                          <li>Educational institutions operating under special models such as international curricula, STEM, or alternative learning systems that fall under Ghana's pre-tertiary category.</li>
                        </ul>
                        <p className="mt-2">Through coordination and monitoring, GNACOPS ensures that these institutions operate ethically, deliver quality learning outcomes, and comply with all national educational requirements.</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">2. School Proprietors and Governing Bodies</p>
                        <p className="mb-2">GNACOPS represents and supports:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>School owners, directors, and boards of governors who manage private pre-tertiary schools.</li>
                          <li>Associations, federations, and networks of private school owners operating at district, regional, or national levels.</li>
                          <li>Faith-based and mission institutions that contribute to private education delivery in Ghana.</li>
                        </ul>
                        <p className="mt-2">The Council provides policy guidance, capacity building, and advisory services to strengthen governance and institutional management across these bodies.</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">3. Teachers and Educational Staff</p>
                        <p className="mb-2">The jurisdiction of GNACOPS includes:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>All teachers, administrators, and support staff within registered private pre-tertiary institutions.</li>
                          <li>Licensed and certified educators operating under the supervision of the National Teaching Council (NTC).</li>
                          <li>Non-teaching professionals contributing to school operations such as guidance counselors, bursars, and ICT coordinators.</li>
                        </ul>
                        <p className="mt-2">GNACOPS works closely with NTC and MoE to promote teacher professionalism, continuous professional development (CPD), and adherence to ethical and performance standards.</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">4. Students and Parent Associations</p>
                        <p className="mb-2">The Council also extends its coordination to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>All learners enrolled in private pre-tertiary schools.</li>
                          <li>Parent-Teacher Associations (PTAs) and School Management Committees (SMCs) functioning within the private education sector.</li>
                        </ul>
                        <p className="mt-2">Through these partnerships, GNACOPS fosters accountability, learner protection, and community participation in the governance and quality assurance processes of private education.</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">5. Regulatory and Supervisory Partnerships</p>
                        <p className="mb-2">GNACOPS collaborates with all major education oversight agencies to harmonize standards and enhance quality in private education delivery.</p>
                        <p className="mb-2">Key partnerships include:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Ministry of Education (MoE) – for national policy alignment and strategic direction.</li>
                          <li>Ghana Education Service (GES) – for teacher management, supervision, and curriculum implementation.</li>
                          <li>National Schools Inspectorate Authority (NaSIA) – for school inspection, accreditation, and compliance.</li>
                          <li>National Teaching Council (NTC) – for teacher licensing and professional development.</li>
                          <li>National Council for Curriculum and Assessment (NaCCA) – for curriculum design and evaluation.</li>
                          <li>Commission for Technical and Vocational Education and Training (CTVET) – for technical and vocational school coordination.</li>
                        </ul>
                        <p className="mt-2">Through these partnerships, GNACOPS functions as the bridge between private education stakeholders and public regulatory bodies, ensuring effective coordination, compliance, and mutual accountability.</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-2">6. Sectoral Scope and Coordination Function</p>
                        <p className="mb-2">GNACOPS's jurisdiction empowers it to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>Maintain a national database of private schools, teachers, and learners.</li>
                          <li>Monitor compliance and operational standards across all categories of private schools.</li>
                          <li>Coordinate communication between private education actors and government regulators.</li>
                          <li>Represent the private sector in national and international educational forums.</li>
                          <li>Provide technical and professional support to ensure that private schools remain aligned with Ghana's education reform agenda.</li>
                        </ul>
                      </div>

                      <p className="font-medium text-foreground">
                        Through this broad jurisdiction, GNACOPS ensures that every private education stakeholder — from the smallest rural kindergarten to the largest corporate school network — operates under a unified, accountable, and forward-looking national system.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Mission & Vision Carousel */}
            {((aboutPage.mission && aboutPage.mission.text) || (aboutPage.vision && aboutPage.vision.text)) && (
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {aboutPage.mission && aboutPage.mission.text && (
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

                  {aboutPage.vision && aboutPage.vision.text && (
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
            {aboutPage.values && aboutPage.values.items && aboutPage.values.items.length > 0 && (
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
                  <h2 className="text-3xl font-bold text-foreground">
                    {aboutPage.values.title || "Our Values"}
                  </h2>
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
