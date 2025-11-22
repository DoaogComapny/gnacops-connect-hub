import { useState } from "react";
import { Lightbulb, TrendingUp, Users, BookOpen, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutletContext } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RISEUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();

  const stats = {
    researchProjects: 15,
    innovations: 8,
    stakeholders: 42,
    edutechInitiatives: 6,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Drive research, innovation, and stakeholder engagement initiatives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Research Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient-accent">{stats.researchProjects}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Innovations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.innovations}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.stakeholders}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">EduTech Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.edutechInitiatives}</div>
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
            New Research Project
          </Button>
          <Button variant="outline">
            <Lightbulb className="h-4 w-4 mr-2" />
            Innovation Hub
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Engage Stakeholders
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            EduTech Resources
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="research" className="space-y-4">
        <TabsList>
          <TabsTrigger value="research">Research Projects</TabsTrigger>
          <TabsTrigger value="innovation">Innovation Hub</TabsTrigger>
          <TabsTrigger value="engagement">Stakeholder Engagement</TabsTrigger>
          <TabsTrigger value="edutech">EduTech Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="research">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Research Projects</CardTitle>
              <CardDescription>Manage policy research and educational studies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Research projects will appear here</p>
                <p className="text-sm">Start your first research project to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innovation">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Innovation Hub</CardTitle>
              <CardDescription>Track innovations and pilot programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Innovation initiatives will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Stakeholder Engagement</CardTitle>
              <CardDescription>Manage relationships with key stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Stakeholder activities will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edutech">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>EduTech Integration</CardTitle>
              <CardDescription>Technology integration and digital learning initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">EduTech initiatives will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
