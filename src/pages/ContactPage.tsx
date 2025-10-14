import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-8 text-center">
            Contact <span className="text-gradient-accent">Us</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card border border-card-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Email</h3>
              <p className="text-muted-foreground text-sm">info@gnacops.org</p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Phone</h3>
              <p className="text-muted-foreground text-sm">+233 XX XXX XXXX</p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Address</h3>
              <p className="text-muted-foreground text-sm">Accra, Ghana</p>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-accent">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent to-accent-glow text-accent-foreground py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_hsl(var(--accent)/0.4)] transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
