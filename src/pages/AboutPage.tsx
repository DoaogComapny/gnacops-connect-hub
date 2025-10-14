import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-8 text-center">
            About <span className="text-gradient-accent">GNACOPS</span>
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              The Ghana National Council of Private Schools (GNACOPS) is a premier organization
              dedicated to supporting and elevating private education standards across Ghana.
            </p>

            <div className="bg-card border border-card-border rounded-lg p-8 my-8">
              <h2 className="text-2xl font-semibold text-accent mb-4">Our Mission</h2>
              <p>
                To support, regulate, and elevate the standards of private educational institutions
                throughout Ghana, ensuring quality education for all students.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-8 my-8">
              <h2 className="text-2xl font-semibold text-accent mb-4">Our Vision</h2>
              <p>
                A thriving private education sector that contributes significantly to Ghana's
                educational excellence and national development.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-8 my-8">
              <h2 className="text-2xl font-semibold text-accent mb-4">Our Values</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Quality in Education</li>
                <li>Integrity and Transparency</li>
                <li>Innovation and Excellence</li>
                <li>Collaboration and Partnership</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
