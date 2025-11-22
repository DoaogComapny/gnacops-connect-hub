import { useState } from "react";
import { FileText, Users, TrendingUp, Plus, Eye, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolicies, type Policy } from "@/hooks/usePolicies";
import { PolicyForm } from "@/components/office/PolicyForm";
import { useOutletContext } from "react-router-dom";

export default function CPDUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();
  const { policies, isLoading, createPolicy, updatePolicy } = usePolicies();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const stats = {
    totalPolicies: policies?.length || 0,
    draftPolicies: policies?.filter(p => p.status === 'draft').length || 0,
    approvedPolicies: policies?.filter(p => p.status === 'approved').length || 0,
    inReview: policies?.filter(p => p.status === 'review').length || 0,
    implemented: policies?.filter(p => p.status === 'implemented').length || 0,
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-yellow-500/10 text-yellow-500',
      review: 'bg-blue-500/10 text-blue-500',
      approved: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
      implemented: 'bg-purple-500/10 text-purple-500',
    };
    return colors[status as keyof typeof colors] || '';
  };

  const handleCreatePolicy = (data: any) => {
    createPolicy(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePolicy = (data: any) => {
    if (selectedPolicy) {
      updatePolicy({ id: selectedPolicy.id, ...data });
      setIsEditDialogOpen(false);
      setSelectedPolicy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Manage policies, track implementation, and coordinate with stakeholders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="hover-glow">
                <CardContent className="pt-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-accent">{stats.totalPolicies}</div>
              </CardContent>
            </Card>

            <Card className="hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{stats.draftPolicies}</div>
              </CardContent>
            </Card>

            <Card className="hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.approvedPolicies}</div>
              </CardContent>
            </Card>

            <Card className="hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats.inReview}</div>
              </CardContent>
            </Card>

            <Card className="hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Implemented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{stats.implemented}</div>
              </CardContent>
            </Card>
          </>
        )}
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
                Create New Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
              </DialogHeader>
              <PolicyForm onSubmit={handleCreatePolicy} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View All Policies
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Stakeholder Collaboration
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </CardContent>
      </Card>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Recent Policies</CardTitle>
          <CardDescription>Recently created and updated policy documents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : policies && policies.length > 0 ? (
            <div className="space-y-4">
              {policies.slice(0, 5).map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{policy.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(policy.created_at).toLocaleDateString()}
                      {policy.deadline && ` • Deadline: ${new Date(policy.deadline).toLocaleDateString()}`}
                    </p>
                    {policy.implementation_progress > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${policy.implementation_progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {policy.implementation_progress}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(policy.status)}>
                      {policy.status}
                    </Badge>
                    <Dialog open={isEditDialogOpen && selectedPolicy?.id === policy.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (!open) setSelectedPolicy(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setSelectedPolicy(policy);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Policy</DialogTitle>
                        </DialogHeader>
                        <PolicyForm
                          onSubmit={handleUpdatePolicy}
                          isLoading={isLoading}
                          initialData={selectedPolicy || undefined}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No policies found</p>
              <p className="text-sm">Create your first policy to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
