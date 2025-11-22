import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { settings } = useSiteSettings();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Membership", path: "/membership" },
    { label: "Marketplace", path: "/marketplace" },
    { label: "News", path: "/news" },
    { label: "Events", path: "/events" },
    { label: "Gallery", path: "/gallery" },
    { label: "Education TV", path: "/education-tv" },
    { label: "Book Appointment", path: "/book-appointment" },
    { label: "Contact", path: "/contact" },
  ];

  const aboutItems = [
    { label: "About", path: "/about" },
    { label: "The Team", path: "/team" },
    { label: "Services", path: "/services" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName || "GNACOPS"} 
                className="h-10 w-auto object-contain" 
              />
            ) : (
              <div className="text-2xl font-bold text-gradient-accent">
                {settings.siteName || "GNACOPS"}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 flex-1 ml-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      {aboutItems.map((item) => (
                        <Link key={item.path} to={item.path}>
                          <NavigationMenuLink
                            className={`block px-4 py-2 rounded-md hover:bg-accent/10 transition-colors ${
                              isActive(item.path) ? "bg-accent/20 text-accent" : ""
                            }`}
                          >
                            {item.label}
                          </NavigationMenuLink>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-accent whitespace-nowrap ${
                  isActive(item.path) ? "text-accent" : "text-foreground/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="hero" size="sm">
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in-up">
            {/* About Dropdown */}
            <div>
              <button
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
              >
                About
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isAboutOpen && (
                <div className="mt-2 ml-4 space-y-2">
                  {aboutItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block text-sm font-medium transition-colors hover:text-accent ${
                        isActive(item.path) ? "text-accent" : "text-foreground/80"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block text-sm font-medium transition-colors hover:text-accent ${
                  isActive(item.path) ? "text-accent" : "text-foreground/80"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="hero" size="sm" className="w-full">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
