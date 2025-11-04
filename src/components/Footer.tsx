import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-secondary border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName || "GNACOPS"} 
                className="h-12 w-auto object-contain mb-4" 
              />
            ) : (
              <h3 className="text-2xl font-bold text-gradient-accent mb-4">
                {settings.siteName || "GNACOPS"}
              </h3>
            )}
            <p className="text-muted-foreground text-sm">
              {settings.tagline || "Ghana National Council of Private Schools - Empowering Excellence in Education"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/membership" className="text-muted-foreground hover:text-accent transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Membership Types */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Membership</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register/institutional" className="text-muted-foreground hover:text-accent transition-colors">
                  Institutional
                </Link>
              </li>
              <li>
                <Link to="/register/teacher" className="text-muted-foreground hover:text-accent transition-colors">
                  Teachers
                </Link>
              </li>
              <li>
                <Link to="/register/parent" className="text-muted-foreground hover:text-accent transition-colors">
                  Parents
                </Link>
              </li>
              <li>
                <Link to="/register/proprietor" className="text-muted-foreground hover:text-accent transition-colors">
                  Proprietors
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 text-accent" />
                <span>{settings.footer?.email || "info@gnacops.org"}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 text-accent" />
                <span>{settings.footer?.phone || "+233 XX XXX XXXX"}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-accent" />
                <span>{settings.footer?.address || "Accra, Ghana"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {settings.siteName || "GNACOPS"}. All rights reserved.
            {settings.foundingYear && (
              <span className="ml-2">
                | Company Age: {new Date().getFullYear() - settings.foundingYear} {new Date().getFullYear() - settings.foundingYear === 1 ? 'Year' : 'Years'}
              </span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
