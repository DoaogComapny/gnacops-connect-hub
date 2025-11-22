import { useState, useEffect } from "react";
import { BookOpen, Users, FileText, TrendingUp, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function CSEDUDashboard() {
  const [stats, setStats] = useState({
    curriculumVersions: 0,
    schoolsAdopted: 0,
    trainingAttendance: 0,
    adoptionRate: 0,
    errorReports: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        curriculumVersions: 12,
        schoolsAdopted: 245,
        trainingAttendance: 1850,
        adoptionRate: 87,
        errorReports: 15,
      });
    } catch (error) {
      console.error('Error fetching CSEDU data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Curriculum Standardization & Educational Development Unit</h1>
        <p className="text-muted-foreground mt-2">
          Manage curriculum development, teacher training, and resource distribution
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Curriculum Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.curriculumVersions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Schools Adopted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.schoolsAdopted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.trainingAttendance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adoption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adoptionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.errorReports}</div>
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
            Create Curriculum
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Resource Library
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Schedule Training
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="curriculum" className="space-y-4">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum Drafting</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="training">Teacher Training</TabsTrigger>
          <TabsTrigger value="resources">Learning Resources</TabsTrigger>
          <TabsTrigger value="adoption">Adoption Tracker</TabsTrigger>
          <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Drafting & Version Control</CardTitle>
              <CardDescription>Create, edit, and manage curriculum versions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Mathematics Curriculum v3.2', status: 'published', schools: 180 },
                  { name: 'Science Curriculum v2.1', status: 'draft', schools: 0 },
                  { name: 'English Language v4.0', status: 'published', schools: 245 },
                ].map((curr, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{curr.name}</h4>
                      <p className="text-sm text-muted-foreground">Adopted by {curr.schools} schools</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={curr.status === 'published' ? 'default' : 'secondary'}>
                        {curr.status}
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

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Distribution to Schools</CardTitle>
              <CardDescription>Manage curriculum rollout and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Curriculum distribution tracking will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Training Scheduling</CardTitle>
              <CardDescription>Plan and manage teacher training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'New Math Curriculum Workshop', date: '2024-02-15', attendees: 120 },
                  { title: 'Science Teaching Methods', date: '2024-02-20', attendees: 95 },
                  { title: 'English Language Best Practices', date: '2024-02-25', attendees: 150 },
                ].map((training, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{training.title}</h4>
                      <Badge>{training.attendees} attendees</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{training.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Learning Resource Repository</CardTitle>
              <CardDescription>Manage educational resources and materials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Resource repository will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adoption">
          <Card>
            <CardHeader>
              <CardTitle>School Curriculum Adoption Tracker</CardTitle>
              <CardDescription>Monitor curriculum adoption across schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { region: 'Greater Accra', adoption: 92 },
                  { region: 'Ashanti Region', adoption: 85 },
                  { region: 'Northern Region', adoption: 78 },
                  { region: 'Eastern Region', adoption: 88 },
                ].map((region, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{region.region}</span>
                      <span className="font-semibold">{region.adoption}%</span>
                    </div>
                    <Progress value={region.adoption} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Assurance Metrics</CardTitle>
              <CardDescription>Monitor curriculum quality and effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quality assurance metrics will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
