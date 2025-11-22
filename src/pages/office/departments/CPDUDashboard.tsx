import { useState, useEffect } from "react";
import { FileText, CheckCircle, Users, Clock, TrendingUp, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Policy {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  deadline: string;
}

export default function CPDUDashboard() {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    draftedPolicies: 0,
    approvedPolicies: 0,
    avgReviewTime: 0,
    complianceLevel: 0,
  });
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch policies and calculate stats
      // This would connect to your actual policies table
      setStats({
        totalPolicies: 45,
        draftedPolicies: 12,
        approvedPolicies: 28,
        avgReviewTime: 7.5,
        complianceLevel: 92,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching CPDU data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-yellow-500/10 text-yellow-500',
      submitted: 'bg-blue-500/10 text-blue-500',
      approved: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
    };
    return colors[status as keyof typeof colors] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Coordination & Policy Development Unit</h1>
        <p className="text-muted-foreground mt-2">
          Manage policies, track implementation, and coordinate with stakeholders
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPolicies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.draftedPolicies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.approvedPolicies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Review Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReviewTime} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.complianceLevel}%</div>
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
            Create New Policy
          </Button>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="tracking">Implementation Tracking</TabsTrigger>
          <TabsTrigger value="memos">Internal Memos</TabsTrigger>
          <TabsTrigger value="directives">Gov Directives</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Management</CardTitle>
              <CardDescription>Draft, submit, and manage policy documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">Policy Title {i}</h4>
                      <p className="text-sm text-muted-foreground">Last updated: 2 days ago</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(i % 2 === 0 ? 'approved' : 'draft')}>
                        {i % 2 === 0 ? 'Approved' : 'Draft'}
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

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Policy Approval Workflow</CardTitle>
              <CardDescription>Track policies through the approval process</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Approval workflow visualization will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stakeholders">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Collaboration Space</CardTitle>
              <CardDescription>Engage with stakeholders on policy development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Stakeholder collaboration tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Policy Implementation Tracking</CardTitle>
              <CardDescription>Monitor progress of policy rollouts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Implementation tracking will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memos">
          <Card>
            <CardHeader>
              <CardTitle>Internal Memos System</CardTitle>
              <CardDescription>Manage internal communications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Internal memos system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directives">
          <Card>
            <CardHeader>
              <CardTitle>Government Directives Tracking</CardTitle>
              <CardDescription>Monitor and respond to government directives</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Government directives tracking will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
