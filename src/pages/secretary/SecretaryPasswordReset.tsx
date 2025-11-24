import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Search, Loader2, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SecretaryPasswordReset = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["secretary-password-reset-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredUsers = users?.filter((user: any) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendResetEmail = async (email: string) => {
    setProcessingEmail(email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent successfully");
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send reset email");
    } finally {
      setProcessingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent mb-2">Password Reset</h1>
        <p className="text-muted-foreground">Send password reset emails to users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            User Password Management
          </CardTitle>
          <CardDescription>Search for users and send password reset emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers?.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{user.full_name || "No name"}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendResetEmail(user.email)}
                    disabled={processingEmail === user.email}
                  >
                    {processingEmail === user.email ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-1" />
                        Send Reset Email
                      </>
                    )}
                  </Button>
                </div>
              ))}
              {filteredUsers?.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretaryPasswordReset;
