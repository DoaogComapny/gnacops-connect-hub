import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
              <section className="bg-gradient-to-br from-card/80 to-card border border-card-border rounded-2xl p-8 md:p-12 shadow-xl hover-glow">
                <h2 className="text-3xl font-bold text-center mb-8 text-accent">Message from the National Executive Director</h2>
                <div className="grid lg:grid-cols-[300px,1fr] gap-8 items-start">
                  {/* Director Image */}
                  {aboutPage.director.imageUrl && (
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
                  
                  {/* Director Message with Accordion Sections */}
                  <div className="space-y-6">
                    {aboutPage.director.bio && (
                      <div className="prose prose-invert max-w-none mb-8">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                          {aboutPage.director.bio}
                        </p>
                      </div>
                    )}

                    {/* Accordion Sections A-J */}
                    <Accordion type="single" collapsible className="space-y-4">
                      <AccordionItem value="a" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          A. Why Join GNACOPS
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`The Ghana National Council of Private Schools (GNACOPS) is the legally recognized coordinating and internal regulatory body for all private pre-tertiary schools in Ghana.

Joining GNACOPS means becoming part of a national ecosystem that champions the collective interests of private education institutions while providing the tools, policies, and support needed to thrive in Ghana's evolving education landscape.

Private schools contribute over 40% of Ghana's educational access, especially in underserved rural and peri-urban areas.
Yet many operate in isolation, lacking representation, training, or sustainable funding.
GNACOPS bridges this gap by giving every school from the smallest basic school to the largest private SHS a united, professional, and credible national voice.

Membership connects you to:
• A strong national advocacy platform influencing education policies at MoE, GES, NaSIA, NTC, and NaCCA levels.
• Structured professional development programs that improve school governance, teacher quality, and operational efficiency.
• Financial and developmental opportunities through GNACOPS partnerships with local and international donors.
• A network of over 14,000 proprietors, 300,000 teachers, and 3.9 million learners driving Ghana's educational transformation.
• Legal and compliance guidance to help schools operate safely, ethically, and in line with national standards.

Join GNACOPS — where private education unites to influence policy, strengthen schools, and impact lives.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="b" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          B. Vision
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`To build a globally competitive, inclusive, and self-sustaining private education system that complements Ghana's national education agenda, empowers communities, and ensures that every child regardless of location or background enjoys access to quality learning opportunities.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="c" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          C. Mission
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`To coordinate, regulate, strengthen, and represent private pre-tertiary schools in Ghana by:

• Promoting quality and compliance in all private education institutions.
• Building capacity and professionalism among teachers, administrators, and proprietors.
• Facilitating innovation, research, and digital transformation in education delivery.
• Establishing financially sustainable models that empower private schools to thrive.
• Advocating for inclusive education policies that protect the interests of learners, parents, and private education providers.

Our mission is to ensure that private education remains a trusted, respected, and sustainable pillar of Ghana's national development.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="d" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          D. Mandate of the Council
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`The Ghana National Council of Private Schools (GNACOPS) is a legally incorporated national coordinating agency mandated to serve as the official representative and internal coordinating authority for all private pre-tertiary schools in Ghana.

GNACOPS operates under the broad policy supervision of the Ministry of Education (MoE) and collaborates with the Ghana Education Service (GES), National Schools Inspectorate Authority (NaSIA), National Teaching Council (NTC), National Council for Curriculum and Assessment (NaCCA), and other relevant stakeholders to ensure alignment between private education and national education standards.

Our Core Mandate Includes:

1. Coordination of Private Education:
Harmonize the operations of all private pre-tertiary schools in Ghana to ensure consistency with national educational policies and standards.

2. Representation and Advocacy:
Serve as the unified national voice for the private education sector — representing school owners, teachers, parents, and learners in national policy discussions and international engagements.

3. Quality Assurance and Compliance Oversight:
Work with NaSIA, NTC, and GES to promote quality education delivery, teacher licensing, and adherence to approved curriculum and infrastructure standards.

4. Policy Formulation and Advisory Role:
Develop and recommend education policies that strengthen private schools while supporting government's broader education objectives.

5. Research and Innovation Promotion:
Conduct sectoral research, promote EduTech integration, and encourage innovative teaching and management practices across private schools.

6. Financial and Institutional Support:
Facilitate access to funding, grants, and partnerships that enhance the sustainability of private education institutions.

7. Conflict Resolution and Support Services:
Provide mediation, legal guidance, and welfare services for school owners, teachers, and students to maintain stability and harmony in the education ecosystem.

8. Monitoring and Reporting:
Track private school compliance with educational policies, ethics, and operational standards, and report findings to relevant authorities for action.

In fulfilling this mandate, GNACOPS bridges the gap between regulation and innovation — ensuring that private schools not only comply but also excel.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="e" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          E. Brief Profile
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`The Ghana National Council of Private Schools (GNACOPS) is a legally incorporated, nationwide coordinating agency serving as the formal representation of the private education sector in Ghana.

GNACOPS operates under the educational policy framework of the Ministry of Education (MoE) and in collaboration with national regulatory bodies — NaSIA, NTC, NaCCA, to ensure that private schools meet quality standards while addressing their unique operational challenges.

Our Ecosystem at a Glance:

• 14,516+ School Owners & Proprietors – Entrepreneurs who invest private resources in public education outcomes.
• 300,000+ Teachers – The second-largest teaching workforce in Ghana, trained and licensed under national standards.
• 3.9 Million Learners – Nearly half of Ghana's school-going children enrolled in GNACOPS member institutions.
• 567,000+ Parents – Active participants and accountability partners in the private education community.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="f" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          F. Our Purpose
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`GNACOPS was established to:

• Coordinate private school operations for effective policy alignment and educational outcomes.
• Represent the interests of the private sector in national and international education dialogues.
• Build a unified, transparent, and accountable education ecosystem that complements the public system.

Through policy engagement, innovation, and stakeholder collaboration, GNACOPS strengthens private education as a key driver of equitable learning and national growth.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="g" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          G. Objectives of the Council
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`GNACOPS's objectives are guided by its commitment to equity, quality, and accountability in private education.

The Council's objectives are both strategic and operational, designed to position private education as a reliable partner in achieving Ghana's Education Strategic Plan (ESP) and the UN Sustainable Development Goal 4 (SDG 4): Quality Education for All.

Strategic Objectives:

1. Policy and Governance:
Establish a robust framework for policy development, governance, and accountability in private education institutions.

2. Quality Assurance:
Set and enforce quality benchmarks for teaching, learning, school infrastructure, and management practices.

3. Capacity Building:
Provide continuous professional development for teachers, administrators, and proprietors to ensure excellence and professionalism.

4. Innovation and Technology Advancement:
Encourage the use of ICT, digital learning tools, and innovative teaching methodologies to enhance learning outcomes.

5. Financial Sustainability:
Develop sustainable financing models, funding schemes, and partnerships that empower private schools to grow and remain resilient.

6. Advocacy and Support Services:
Represent private schools at all policy levels, mediate disputes, and offer legal and operational guidance for schools in distress.

7. Compliance and Accountability:
Monitor and report on ethical, operational, and financial practices across private schools, ensuring transparency and good governance.

8. Partnership and Collaboration:
Work with government agencies, NGOs, development partners, and the private sector to strengthen educational access and quality nationwide.

9. Equity and Access:
Promote inclusive education by supporting private schools serving disadvantaged and rural communities.

Through these objectives, GNACOPS seeks to transform private education into a model of excellence — empowering learners, uplifting educators, and contributing to Ghana's socio-economic growth.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="h" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          H. Departments and Their Focus
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`To deliver on its mandate effectively, GNACOPS operates through seven specialized departments, each designed to serve a vital function within the private education framework:

1. Coordination and Policy Development Unit (CPDU)
Develops, reviews, and harmonizes policies for private schools.
Serves as the liaison between GNACOPS and national education authorities to ensure all private schools align with MoE, NaSIA, and GES regulations.

2. Educational Standards and Compliance Unit (ESCU)
Oversees accreditation, quality assurance, and teacher licensing in collaboration with NaSIA and NTC.
Conducts compliance audits, school inspections, and professional development for educators.

3. Financial Sustainability and Developmental Support Unit (FSDSU)
Designs and implements financial support mechanisms, including grants, revolving funds, and credit schemes to strengthen the financial resilience of private schools.
Promotes financial literacy and sustainable business models for school proprietors.

4. Curriculum Standardization and Educational Development Unit (CSEDU)
Works closely with NaCCA and GES to align private school curricula with national learning standards.
Develops teaching resources, promotes STEM and competency-based education, and delivers teacher training.

5. Research, Innovation and Stakeholder Engagement Unit (RISEU)
Drives evidence-based decision-making through research and data analytics.
Promotes digital transformation, stakeholder partnerships, and the adoption of innovative educational technologies.

6. Support Services and Advocacy Unit (SSAU)
Provides legal, counseling, and health support to private schools.
Handles dispute resolution, promotes school safety, and advocates for teacher and student welfare.

7. Private Education Compliance Unit (PECU)
Monitors ethical, operational, and financial integrity across private schools.
Investigates malpractice, fraud, and compliance breaches while promoting accountability and transparency.

Together, these departments form the backbone of GNACOPS' internal governance — ensuring structure, accountability, and excellence across the private education landscape.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="i" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          I. Benefits of Membership
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`Membership with GNACOPS opens the door to growth, credibility, and support for every private education stakeholder.

For School Owners & Proprietors:

• Representation at the Ministry of Education and national policy platforms.
• Access to GNACOPS financial support programs and donor partnerships.
• Business advisory, governance, and sustainability support.

For Teachers:

• Access to continuous professional development (CPD) and certification programs.
• Inclusion in the national teacher licensing system under NTC supervision.
• Networking and exchange programs with other private educators nationwide.

For Parents:

• A platform to ensure accountability, transparency, and welfare in private schools.
• Opportunities to participate in school improvement and scholarship initiatives.

For Learners:

• Access to safe, compliant, and quality learning environments.
• Opportunities for scholarship, digital learning, and skills-based education.

Institutional & Systemic Benefits:

• Integration into Ghana's official education policy framework.
• Support for data-driven decision-making and school improvement.
• Advocacy and protection of private education rights.

GNACOPS membership is more than affiliation — it is a partnership for progress, integrity, and transformation in Ghana's education system.`}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="j" className="border border-card-border rounded-lg px-4 hover-glow">
                        <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                          J. Jurisdiction of the Council
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {`The Ghana National Council of Private Schools (GNACOPS) exercises national coordinating authority over all private pre-tertiary education institutions in Ghana.

This jurisdiction ensures that private schools, their management bodies, teachers, and learners operate within a well-structured, compliant, and self-sustaining framework that aligns with the national education policy and regulatory standards.

GNACOPS functions as the internal coordinating agency for the private education sector, complementing the external regulatory role of the Ministry of Education (MoE), the Ghana Education Service (GES), and the National Schools Inspectorate Authority (NaSIA).

Its jurisdiction extends across every dimension of the private pre-tertiary education ecosystem, encompassing policy coordination, compliance monitoring, stakeholder engagement, and institutional development.

1. Private Pre-Tertiary Schools
GNACOPS's authority covers all registered and accredited private institutions within the pre-tertiary level, including:
• Private Kindergarten, Primary, and Junior High Schools.
• Private Senior High Schools, Technical, and Vocational Institutions.
• Faith-based, community-based, and corporate-owned schools.
• Educational institutions operating under special models such as international curricula, STEM, or alternative learning systems that fall under Ghana's pre-tertiary category.

2. School Proprietors and Governing Bodies
GNACOPS represents and supports:
• School owners, directors, and boards of governors who manage private pre-tertiary schools.
• Associations, federations, and networks of private school owners operating at district, regional, or national levels.
• Faith-based and mission institutions that contribute to private education delivery in Ghana.

3. Teachers and Educational Staff
The jurisdiction of GNACOPS includes:
• All teachers, administrators, and support staff within registered private pre-tertiary institutions.
• Licensed and certified educators operating under the supervision of the National Teaching Council (NTC).
• Non-teaching professionals contributing to school operations such as guidance counselors, bursars, and ICT coordinators.

4. Students and Parent Associations
The Council also extends its coordination to:
• All learners enrolled in private pre-tertiary schools.
• Parent-Teacher Associations (PTAs) and School Management Committees (SMCs) functioning within the private education sector.

5. Regulatory and Supervisory Partnerships
GNACOPS collaborates with all major education oversight agencies to harmonize standards and enhance quality in private education delivery.

Through this broad jurisdiction, GNACOPS ensures that every private education stakeholder — from the smallest rural kindergarten to the largest corporate school network — operates under a unified, accountable, and forward-looking national system.`}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </section>
            )}

            {/* Mission & Vision Carousel */}
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {aboutPage.mission && aboutPage.mission.text && (
                  <CarouselItem className="md:basis-1/2">
                    <div className="h-full p-2">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover-glow h-full">
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
                    </div>
                  </CarouselItem>
                )}

                {aboutPage.vision && aboutPage.vision.text && (
                  <CarouselItem className="md:basis-1/2">
                    <div className="h-full p-2">
                      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover-glow h-full">
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
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="hover-glow" />
              <CarouselNext className="hover-glow" />
            </Carousel>

            {/* Values Section */}
            {aboutPage.values && aboutPage.values.items && aboutPage.values.items.length > 0 && (
              <section className="bg-card border border-card-border rounded-2xl p-8 md:p-12 hover-glow">
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
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover-glow">
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
