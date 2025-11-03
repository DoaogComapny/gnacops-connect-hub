import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AdminSignup = () => {
  const [email, setEmail] = useState("admin@gnacops.com");
  const [password, setPassword] = useState("Obenfo2025");
  const [fullName, setFullName] = useState("Admin User");
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast.error("Signup error: " + error.message);
    } else {
      toast.success("Admin account created! Please check your email to verify.");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-card-border rounded-lg p-8 shadow-elegant">
          <h1 className="text-3xl font-bold text-center mb-2">
            Admin <span className="text-gradient-accent">Signup</span>
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Create the first admin account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
                placeholder="Admin User"
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
                placeholder="admin@gnacops.com"
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

            <Button type="submit" variant="hero" className="w-full">
              Create Admin Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
