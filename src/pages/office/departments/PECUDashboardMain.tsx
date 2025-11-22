import { useState } from "react";
import { Shield, FileText, BookOpen, CheckCircle, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOutletContext } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PECUDashboardMain() {
  const { departmentName } = useOutletContext<{ departmentCode: string; departmentName: string }>();

  const stats = {
    monitoredSchools: 320,
    complianceReports: 45,
    irregularities: 12,
    enforcementActions: 8,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient-accent mb-2">{departmentName}</h1>
        <p className="text-muted-foreground">
          Monitor compliance, report irregularities, and enforce educational standards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monitored Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient-accent">{stats.monitoredSchools}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.complianceReports}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Irregularities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.irregularities}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enforcement Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.enforcementActions}</div>
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
            Report Irregularity
          </Button>
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Compliance Monitoring
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Education Resources
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Enforcement Actions
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Compliance Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Irregularity Reports</TabsTrigger>
          <TabsTrigger value="education">Stakeholder Education</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>Track compliance across all registered schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Compliance monitoring data will appear here</p>
                <p className="text-sm">Real-time monitoring of educational compliance.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Irregularity Reports</CardTitle>
              <CardDescription>Manage and track reported irregularities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Irregularity reports will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Stakeholder Education</CardTitle>
              <CardDescription>Educational resources and training materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Education resources will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enforcement">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Enforcement Actions</CardTitle>
              <CardDescription>Track enforcement measures and outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Enforcement actions will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
