import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, AlertCircle, FileText, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function FSDSUDashboard() {
  const [stats, setStats] = useState({
    fundingSecured: 0,
    fundingInReview: 0,
    grantsAwarded: 0,
    schoolsAssisted: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        fundingSecured: 2500000,
        fundingInReview: 850000,
        grantsAwarded: 45,
        schoolsAssisted: 78,
        totalBudget: 5000000,
      });
    } catch (error) {
      console.error('Error fetching FSDSU data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Financial Sustainability & Developmental Support Unit</h1>
        <p className="text-muted-foreground mt-2">
          Manage grants, funding applications, and school financial support
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funding Secured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.fundingSecured)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.fundingInReview)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Grants Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.grantsAwarded}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Schools Assisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.schoolsAssisted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
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
            <Plus className="h-4 w-4 mr-2" />
            New Grant Application
          </Button>
          <Button variant="outline">
            <DollarSign className="h-4 w-4 mr-2" />
            View Funding Tracker
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Financial Reports
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Revenue Projections
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="grants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grants">Grant Applications</TabsTrigger>
          <TabsTrigger value="assessment">Financial Assessment</TabsTrigger>
          <TabsTrigger value="budget">Budget Management</TabsTrigger>
          <TabsTrigger value="projections">Revenue Projections</TabsTrigger>
          <TabsTrigger value="alerts">Financial Alerts</TabsTrigger>
          <TabsTrigger value="support">School Support</TabsTrigger>
        </TabsList>

        <TabsContent value="grants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grant & Funding Applications Tracker</CardTitle>
              <CardDescription>Manage and track all funding applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'UNESCO Education Grant 2024', amount: 500000, status: 'approved' },
                  { title: 'Private School Development Fund', amount: 350000, status: 'pending' },
                  { title: 'Infrastructure Improvement Grant', amount: 750000, status: 'under_review' },
                ].map((grant, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{grant.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatCurrency(grant.amount)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={grant.status === 'approved' ? 'default' : 'secondary'}>
                        {grant.status.replace('_', ' ')}
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

        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>School Financial Assessment Tool</CardTitle>
              <CardDescription>Assess school financial health and needs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Financial assessment tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Management Workspace</CardTitle>
              <CardDescription>Plan and manage departmental budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Budget management interface will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>Forecast future funding and revenue streams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Revenue projection charts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Financial Alerts & Risk Warnings</CardTitle>
              <CardDescription>Monitor financial risks and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Financial alert system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>School Support Planning</CardTitle>
              <CardDescription>Plan financial support for schools in need</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">School support planning tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
