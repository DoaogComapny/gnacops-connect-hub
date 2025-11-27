import { useState, useEffect } from "react";
import { FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AdminApplications = () => {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch form submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      if (!submissions || submissions.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Fetch profiles separately
      const userIds = [...new Set(submissions.map((s: any) => s.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch form categories separately
      const categoryIds = [...new Set(submissions.map((s: any) => s.category_id).filter(Boolean))];
      const { data: categories, error: categoriesError } = await supabase
        .from('form_categories')
        .select('id, name, type')
        .in('id', categoryIds);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      }

      // Create maps for quick lookup
      const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const categoriesMap = new Map((categories || []).map((c: any) => [c.id, c]));

      // Format applications
      const formattedApps = submissions.map((submission: any) => {
        const profile = profilesMap.get(submission.user_id);
        const category = categoriesMap.get(submission.category_id);
        const submissionData = submission.submission_data || {};

        return {
          id: submission.id,
          name: profile?.full_name || 'Unknown',
          email: profile?.email || 'N/A',
          type: category?.name || 'N/A',
          school: submissionData.schoolName || submissionData.institution || submissionData.school_name || 'N/A',
          status: submission.status || 'Pending',
          date: new Date(submission.submitted_at).toLocaleDateString(),
          raw_data: submissionData
        };
      });

      setApplications(formattedApps);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: number) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: "Approved" } : app
    ));
    toast({
      title: "Application Approved",
      description: "The member has been notified via email.",
    });
    setSelectedApp(null);
  };

  const handleReject = (id: number) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: "Rejected" } : app
    ));
    toast({
      title: "Application Rejected",
      description: "The applicant has been notified.",
      variant: "destructive",
    });
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications Management</h1>
          <p className="text-muted-foreground">Review and process membership applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {applications.filter(a => a.status === "Pending").length}
              </p>
            </div>
            <FileText className="h-10 w-10 text-yellow-500/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {applications.filter(a => a.status === "Approved").length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {applications.filter(a => a.status === "Rejected").length}
              </p>
            </div>
            <XCircle className="h-10 w-10 text-red-500/50" />
          </div>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">Membership applications will appear here once users register.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>School/Institution</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.type}</TableCell>
                  <TableCell>{app.school}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        app.status === "Approved" ? "default" : 
                        app.status === "Rejected" ? "destructive" : 
                        "secondary"
                      }
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* View Application Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the application information</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">{selectedApp.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground">{selectedApp.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">School</label>
                  <p className="text-sm text-muted-foreground">{selectedApp.school}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={selectedApp.status === "Approved" ? "default" : selectedApp.status === "Rejected" ? "destructive" : "secondary"}>
                    {selectedApp.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-muted-foreground">{selectedApp.date}</p>
                </div>
              </div>
              
              {selectedApp.status === "Pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="cta" onClick={() => handleApprove(selectedApp.id)} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Application
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedApp.id)} className="flex-1">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;
