import Navbar from "@/components/Navbar";
import MembershipCards from "@/components/MembershipCards";
import Footer from "@/components/Footer";

const MembershipPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <MembershipCards />
      </div>
      <Footer />
    </div>
  );
};

export default MembershipPage;
