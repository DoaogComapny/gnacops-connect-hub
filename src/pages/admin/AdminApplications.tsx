import { useState } from "react";
import { FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AdminApplications = () => {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [applications, setApplications] = useState([
    { id: 1, name: "John Doe", type: "Institutional", status: "Pending", date: "2025-01-15", school: "ABC Academy", email: "john@example.com" },
    { id: 2, name: "Jane Smith", type: "Teacher Council", status: "Pending", date: "2025-01-14", school: "XYZ School", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", type: "Proprietor", status: "Approved", date: "2025-01-13", school: "Elite School", email: "bob@example.com" },
    { id: 4, name: "Alice Brown", type: "Parent Council", status: "Rejected", date: "2025-01-12", school: "Smart Kids", email: "alice@example.com" },
  ]);

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
