import { useState, useEffect } from "react";
import { HeadphonesIcon, AlertCircle, CheckCircle, Clock, MessageSquare, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SSAUDashboard() {
  const [stats, setStats] = useState({
    casesResolved: 0,
    casesPending: 0,
    avgResponseTime: 0,
    activeCampaigns: 0,
    supportRequests: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        casesResolved: 187,
        casesPending: 23,
        avgResponseTime: 2.3,
        activeCampaigns: 8,
        supportRequests: 45,
      });
    } catch (error) {
      console.error('Error fetching SSAU data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Support Services & Advocacy Unit</h1>
        <p className="text-muted-foreground mt-2">
          Manage school assistance, handle cases, and run advocacy campaigns
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cases Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.casesResolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cases Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.casesPending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Support Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.supportRequests}</div>
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
            New Support Case
          </Button>
          <Button variant="outline">
            <HeadphonesIcon className="h-4 w-4 mr-2" />
            View All Cases
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat Support
          </Button>
          <Button variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            View Campaigns
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="ticketing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ticketing">Assistance Ticketing</TabsTrigger>
          <TabsTrigger value="workflow">Case Workflow</TabsTrigger>
          <TabsTrigger value="welfare">School Welfare</TabsTrigger>
          <TabsTrigger value="advocacy">Advocacy Campaigns</TabsTrigger>
          <TabsTrigger value="sla">Support SLAs</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="ticketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Assistance Ticketing System</CardTitle>
              <CardDescription>Manage support requests from schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'TKT-1001', school: 'Accra International School', issue: 'Infrastructure Support', status: 'open', priority: 'high' },
                  { id: 'TKT-1002', school: 'Kumasi Private Academy', issue: 'Teacher Dispute', status: 'in_progress', priority: 'urgent' },
                  { id: 'TKT-1003', school: 'Tamale Education Center', issue: 'License Renewal', status: 'resolved', priority: 'medium' },
                ].map((ticket, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{ticket.school}</h4>
                      <p className="text-sm text-muted-foreground">{ticket.issue}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={ticket.status === 'resolved' ? 'default' : 'outline'}>
                        {ticket.status.replace('_', ' ')}
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
              <CardTitle>Case Handling Workflow</CardTitle>
              <CardDescription>Manage case progression and assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Case workflow management tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="welfare">
          <Card>
            <CardHeader>
              <CardTitle>School Welfare Monitoring</CardTitle>
              <CardDescription>Track school welfare and wellbeing indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">School welfare monitoring dashboard will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advocacy">
          <Card>
            <CardHeader>
              <CardTitle>Advocacy Campaign Planner</CardTitle>
              <CardDescription>Plan and manage advocacy initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Teacher Welfare Awareness Campaign', status: 'active', reach: 5000 },
                  { name: 'School Safety Initiative', status: 'planning', reach: 0 },
                  { name: 'Parent Engagement Program', status: 'active', reach: 3200 },
                ].map((campaign, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Reach: {campaign.reach} people</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>Support Response SLAs</CardTitle>
              <CardDescription>Monitor service level agreement compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">SLA monitoring will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Submission and Resolution</CardTitle>
              <CardDescription>Handle school complaints and grievances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Complaint management system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
