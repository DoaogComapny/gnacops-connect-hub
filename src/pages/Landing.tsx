import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import MembershipCards from "@/components/MembershipCards";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutSection />
      <MembershipCards />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Landing;
