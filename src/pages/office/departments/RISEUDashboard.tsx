import { useState, useEffect } from "react";
import { Microscope, Users, Lightbulb, Calendar, TrendingUp, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function RISEUDashboard() {
  const [stats, setStats] = useState({
    researchProjects: 0,
    reportsPublished: 0,
    stakeholderMeetings: 0,
    ideasCollected: 0,
    activePartners: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        researchProjects: 28,
        reportsPublished: 45,
        stakeholderMeetings: 67,
        ideasCollected: 134,
        activePartners: 52,
      });
    } catch (error) {
      console.error('Error fetching RISEU data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Research, Innovation & Stakeholder Engagement Unit</h1>
        <p className="text-muted-foreground mt-2">
          Conduct research, foster innovation, and manage stakeholder relationships
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Research Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.researchProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.reportsPublished}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stakeholder Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.stakeholderMeetings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ideas Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.ideasCollected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePartners}</div>
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
            New Research Project
          </Button>
          <Button variant="outline">
            <Microscope className="h-4 w-4 mr-2" />
            Research Database
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Stakeholder Directory
          </Button>
          <Button variant="outline">
            <Lightbulb className="h-4 w-4 mr-2" />
            Innovation Portal
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="research" className="space-y-4">
        <TabsList>
          <TabsTrigger value="research">Research Projects</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholder Directory</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Collection</TabsTrigger>
          <TabsTrigger value="analytics">Data Analytics</TabsTrigger>
          <TabsTrigger value="field">Field Research</TabsTrigger>
          <TabsTrigger value="innovation">Innovation Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Research Project Database</CardTitle>
              <CardDescription>Manage all ongoing and completed research projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Private School Quality Assessment Study', status: 'ongoing', progress: 65 },
                  { title: 'Teacher Retention in Rural Areas', status: 'ongoing', progress: 40 },
                  { title: 'Impact of Digital Learning Tools', status: 'completed', progress: 100 },
                  { title: 'Parental Involvement Survey', status: 'planning', progress: 15 },
                ].map((project, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">Progress: {project.progress}%</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status}
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

        <TabsContent value="stakeholders">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Directory</CardTitle>
              <CardDescription>Manage relationships with NGOs, government agencies, and schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Ministry of Education', type: 'Government', engagement: 'High' },
                  { name: 'UNICEF Ghana', type: 'NGO', engagement: 'Medium' },
                  { name: 'Ghana Education Service', type: 'Government', engagement: 'High' },
                  { name: 'Private Schools Association', type: 'Association', engagement: 'High' },
                ].map((stakeholder, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{stakeholder.name}</h4>
                      <p className="text-sm text-muted-foreground">{stakeholder.type}</p>
                    </div>
                    <Badge>{stakeholder.engagement} Engagement</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Collection Tool</CardTitle>
              <CardDescription>Gather feedback from stakeholders and schools</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Feedback collection interface will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Data Analytics Visualization</CardTitle>
              <CardDescription>Analyze research data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Data analytics dashboards will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field">
          <Card>
            <CardHeader>
              <CardTitle>Field Research Task Planner</CardTitle>
              <CardDescription>Plan and manage field research activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Field research planning tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innovation">
          <Card>
            <CardHeader>
              <CardTitle>Innovation Submissions (Idea Portal)</CardTitle>
              <CardDescription>Collect and review innovative ideas from stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Innovation Idea {i}</h4>
                      <Badge variant="outline">New</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Submitted 2 days ago</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
