import { useState } from "react";
import { DollarSign, FileText, Users, TrendingUp, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutletContext } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GrantForm } from "@/components/office/GrantForm";
import { useGrantApplications } from "@/hooks/useGrantApplications";

export default function FSDSUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();
  const { applications, isLoading, createApplication } = useGrantApplications();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const stats = {
    totalApplications: applications?.length || 0,
    approved: applications?.filter(a => a.status === 'approved').length || 0,
    pending: applications?.filter(a => a.status === 'pending').length || 0,
    totalAmount: applications?.reduce((sum, a) => sum + Number(a.amount || 0), 0) || 0,
    approvedAmount: applications?.filter(a => a.status === 'approved').reduce((sum, a) => sum + Number(a.amount || 0), 0) || 0,
  };

  const handleCreateApplication = (data: any) => {
    createApplication(data);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Manage grant applications, financial resources, and partnerships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient-accent">{stats.totalApplications}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-accent">GH₵{stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">GH₵{stats.approvedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Grant Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Grant Application</DialogTitle>
              </DialogHeader>
              <GrantForm onSubmit={handleCreateApplication} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View All Applications
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Partnerships
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Financial Reports
          </Button>
        </CardContent>
      </Card>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Recent Grant Applications</CardTitle>
          <CardDescription>Latest grant application submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading applications...</p>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold">{app.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Amount: GH₵{Number(app.amount).toLocaleString()}
                      {app.deadline && ` • Deadline: ${new Date(app.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={app.status === 'approved' ? 'default' : 'outline'}>
                      {app.status}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No applications found</p>
              <p className="text-sm">Create your first grant application to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
