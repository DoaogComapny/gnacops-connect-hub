import { useState } from "react";
import { MessageSquare, Shield, CheckCircle, FileText, Users, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutletContext } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SupportCaseForm } from "@/components/office/SupportCaseForm";
import { useSupportCases } from "@/hooks/useSupportCases";

export default function SSAUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();
  const { cases, isLoading, createCase } = useSupportCases();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const stats = {
    totalCases: cases?.length || 0,
    openCases: cases?.filter(c => c.status === 'open').length || 0,
    resolvedCases: cases?.filter(c => c.status === 'resolved').length || 0,
    disputes: cases?.filter(c => c.priority === 'high').length || 0,
  };

  const handleCreateCase = (data: any) => {
    createCase(data);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Manage support cases, disputes, health programs, and legal assistance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient-accent">{stats.totalCases}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.openCases}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.resolvedCases}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.disputes}</div>
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
                New Support Case
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Support Case</DialogTitle>
              </DialogHeader>
              <SupportCaseForm onSubmit={handleCreateCase} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Dispute Resolution
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Health Programs
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Legal Support
          </Button>
        </CardContent>
      </Card>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Recent Support Cases</CardTitle>
          <CardDescription>Latest support and assistance requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading cases...</p>
          ) : cases && cases.length > 0 ? (
            <div className="space-y-4">
              {cases.slice(0, 5).map((case_item: any) => (
                <div key={case_item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold">{case_item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Priority: {case_item.priority} • Created: {new Date(case_item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={case_item.status === 'resolved' ? 'default' : 'outline'}>
                      {case_item.status}
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
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No support cases found</p>
              <p className="text-sm">Create your first case to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
