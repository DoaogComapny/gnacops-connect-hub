import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SecretaryApplications = () => {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["secretary-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          *,
          profiles!inner(full_name, email),
          form_categories(name),
          memberships!inner(gnacops_id, status, payment_status)
        `)
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("memberships")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretary-applications"] });
      toast.success("Application status updated");
      setSelectedApp(null);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent mb-2">Approve Applications</h1>
        <p className="text-muted-foreground">Review and approve membership applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Applications
          </CardTitle>
          <CardDescription>Review submitted membership applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {applications?.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{app.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{app.memberships?.gnacops_id}</Badge>
                      <Badge variant="secondary">{app.form_categories?.name}</Badge>
                      <Badge
                        variant={
                          app.memberships?.status === "active"
                            ? "default"
                            : app.memberships?.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {app.memberships?.status}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                    Review
                  </Button>
                </div>
              ))}
              {applications?.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No applications found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review and approve/reject this application</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <p className="font-semibold">{selectedApp.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedApp.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GNACOPS ID</p>
                  <p className="font-semibold">{selectedApp.memberships?.gnacops_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{selectedApp.form_categories?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Application Data</p>
                <div className="p-4 bg-muted/30 rounded-lg max-h-60 overflow-auto">
                  <pre className="text-xs">{JSON.stringify(selectedApp.submission_data, null, 2)}</pre>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedApp.memberships?.id,
                      status: "rejected",
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedApp.memberships?.id,
                      status: "active",
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecretaryApplications;
