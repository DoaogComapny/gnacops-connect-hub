import { useState, useEffect } from "react";
import { School, CheckCircle, AlertTriangle, Calendar, TrendingUp, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InspectionForm } from "@/components/office/InspectionForm";
import { useSchoolInspections } from "@/hooks/useSchoolInspections";

export default function ESCUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();
  const { inspections, isLoading, createInspection } = useSchoolInspections();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const stats = {
    totalInspections: inspections?.length || 0,
    compliantSchools: inspections?.filter(i => i.compliance_score >= 80).length || 0,
    flaggedSchools: inspections?.filter(i => i.compliance_score < 60).length || 0,
    avgComplianceScore: inspections?.length 
      ? Math.round(inspections.reduce((sum, i) => sum + (i.compliance_score || 0), 0) / inspections.length)
      : 0,
    pendingReviews: inspections?.filter(i => i.status === 'scheduled').length || 0,
  };

  const handleCreateInspection = (data: any) => {
    createInspection(data);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Monitor standards enforcement, schedule inspections, and track compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient-accent">{stats.totalInspections}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliant Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.compliantSchools}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.flaggedSchools}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.avgComplianceScore}%</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingReviews}</div>
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
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Inspection</DialogTitle>
              </DialogHeader>
              <InspectionForm onSubmit={handleCreateInspection} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <School className="h-4 w-4 mr-2" />
            View All Schools
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Compliance Checker
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </CardContent>
      </Card>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Standards Compliance Overview</CardTitle>
          <CardDescription>Real-time monitoring of educational standards compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Teacher Qualification Standards', compliance: 92 },
              { name: 'Infrastructure Requirements', compliance: 85 },
              { name: 'Curriculum Standards', compliance: 95 },
              { name: 'Safety & Health Standards', compliance: 78 },
            ].map((standard, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{standard.name}</span>
                  <span className="font-semibold text-gradient-accent">{standard.compliance}%</span>
                </div>
                <Progress value={standard.compliance} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
          <CardDescription>Latest school inspection results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading inspections...</p>
          ) : inspections && inspections.length > 0 ? (
            <div className="space-y-4">
              {inspections.slice(0, 5).map((inspection: any) => (
                <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold">{inspection.school_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Inspection Date: {new Date(inspection.inspection_date).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium">Compliance Score:</span>
                      <Progress value={inspection.compliance_score || 0} className="w-32 h-2" />
                      <span className="text-sm font-semibold">{inspection.compliance_score || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={inspection.status === 'completed' ? 'default' : 'outline'}>
                      {inspection.status}
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
              <School className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No inspections found</p>
              <p className="text-sm">Schedule your first inspection to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
