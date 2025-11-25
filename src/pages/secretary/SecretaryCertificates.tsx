import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Search, Download, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SecretaryCertificates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: memberships, isLoading } = useQuery({
    queryKey: ["secretary-memberships-for-certificates", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("memberships")
        .select(`
          *,
          profiles!inner(full_name, email),
          form_categories(name),
          certificates(id, certificate_url, issued_at)
        `)
        .order("created_at", { ascending: false });

      if (filterStatus === "with-cert") {
        query = query.not("certificates", "is", null);
      } else if (filterStatus === "without-cert") {
        query = query.is("certificates", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredMemberships = memberships?.filter((m: any) =>
    m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.gnacops_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateCertificate = async (membershipId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { membershipId }
      });

      if (error) throw error;

      toast.success("Certificate generated successfully!");
      // Refresh the list
      window.location.reload();
    } catch (error: any) {
      console.error("Error generating certificate:", error);
      toast.error(error.message || "Failed to generate certificate");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent mb-2">Generate Certificates</h1>
        <p className="text-muted-foreground">Issue membership certificates to approved members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Management
          </CardTitle>
          <CardDescription>Search and generate certificates for members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or GNACOPS ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="with-cert">With Certificate</SelectItem>
                <SelectItem value="without-cert">Without Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMemberships?.map((membership: any) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold">{membership.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{membership.profiles?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {membership.gnacops_id}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {membership.form_categories?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {membership.certificates?.length > 0 ? (
                      <>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Issued
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateCertificate(membership.id)}
                      >
                        <Award className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredMemberships?.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No members found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretaryCertificates;
