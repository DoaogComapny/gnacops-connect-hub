import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  description: string | null;
  photo_url: string | null;
  position_order: number;
}

const TeamPage = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("position_order", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl font-bold mb-4 text-center text-gradient-accent">The Team</h1>
          <p className="text-xl text-center text-muted-foreground mb-12">Meet our dedicated team</p>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">No team members available at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="hover-glow hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-card/80 to-card"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      {member.photo_url ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-primary/20">
                          <span className="text-4xl font-bold text-primary">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                      <p className="text-accent font-medium mb-3">{member.position}</p>
                      {member.description && (
                        <p className="text-muted-foreground leading-relaxed">{member.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamPage;