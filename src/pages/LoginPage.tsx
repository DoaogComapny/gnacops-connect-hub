import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const LoginPage = () => {
  const [gnacopsId, setGnacopsId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic will be implemented later
    console.log("Login attempt:", { gnacopsId, email, password });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-lg p-8 shadow-elegant">
            <h1 className="text-3xl font-bold text-center mb-2">
              Welcome <span className="text-gradient-accent">Back</span>
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Login to access your GNACOPS member dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  GNACOPS ID
                </label>
                <input
                  type="text"
                  value={gnacopsId}
                  onChange={(e) => setGnacopsId(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="e.g., GNC/PM/01/0001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot" className="text-accent hover:text-accent-glow transition-colors">
                  Forgot GNACOPS ID or Password?
                </Link>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                Login
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/membership" className="text-accent hover:text-accent-glow transition-colors font-medium">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
