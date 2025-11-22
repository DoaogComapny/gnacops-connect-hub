import { useState } from "react";
import { BookOpen, FileText, Users, CheckCircle, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutletContext } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CSEDUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();

  const stats = {
    totalResources: 45,
    assessmentTools: 12,
    trainingPrograms: 8,
    activeTrainings: 5,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Manage curriculum resources, assessments, and training programs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient-accent">{stats.totalResources}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessment Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.assessmentTools}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.trainingPrograms}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.activeTrainings}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Curriculum Resource
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            View All Resources
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Schedule Training
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Curriculum Resources</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Tools</TabsTrigger>
          <TabsTrigger value="training">Training Programs</TabsTrigger>
          <TabsTrigger value="library">Resource Library</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Curriculum Resources</CardTitle>
              <CardDescription>Manage curriculum alignment and standardization resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Curriculum resources will appear here</p>
                <p className="text-sm">Upload your first resource to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Assessment Tools</CardTitle>
              <CardDescription>Create and manage assessment tools and frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Assessment tools will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>Schedule and manage teacher training programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Training programs will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Resource Library</CardTitle>
              <CardDescription>Browse and download educational resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Resource library will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
