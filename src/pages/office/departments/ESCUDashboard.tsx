import { useState, useEffect } from "react";
import { School, CheckCircle, AlertTriangle, Calendar, TrendingUp, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function ESCUDashboard() {
  const [stats, setStats] = useState({
    totalInspections: 0,
    compliantSchools: 0,
    flaggedSchools: 0,
    avgComplianceScore: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        totalInspections: 156,
        compliantSchools: 132,
        flaggedSchools: 24,
        avgComplianceScore: 87,
        pendingReviews: 18,
      });
    } catch (error) {
      console.error('Error fetching ESCU data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Educational Standards & Compliance Unit</h1>
        <p className="text-muted-foreground mt-2">
          Monitor standards enforcement, schedule inspections, and track compliance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInspections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliant Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.compliantSchools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.flaggedSchools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.avgComplianceScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Inspection
          </Button>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Standards Monitoring</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Checker</TabsTrigger>
          <TabsTrigger value="reports">Inspection Reports</TabsTrigger>
          <TabsTrigger value="ratings">School Ratings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standards Enforcement Monitoring</CardTitle>
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
                      <span>{standard.name}</span>
                      <span className="font-semibold">{standard.compliance}%</span>
                    </div>
                    <Progress value={standard.compliance} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle>School Inspection Scheduling</CardTitle>
              <CardDescription>Plan and manage school inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Inspection scheduling calendar will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checker</CardTitle>
              <CardDescription>Review flagged schools and compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">School Name {i}</h4>
                      <p className="text-sm text-muted-foreground">Last inspection: {i} weeks ago</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={i === 1 ? "destructive" : "outline"}>
                        {i === 1 ? 'Flagged' : 'Under Review'}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Reports</CardTitle>
              <CardDescription>Upload and manage inspection reports with scorecards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Inspection reports management will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>School Ratings System</CardTitle>
              <CardDescription>View and manage school performance ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">School ratings system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Alerts</CardTitle>
              <CardDescription>Monitor alerts for non-compliant schools</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Alert system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
