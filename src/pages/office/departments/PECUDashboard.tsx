import { useState, useEffect } from "react";
import { School, CheckCircle, Clock, AlertCircle, FileCheck, Plus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function PECUDashboard() {
  const [stats, setStats] = useState({
    registrationsCompleted: 0,
    registrationsPending: 0,
    registrationsRejected: 0,
    activeLicenses: 0,
    complianceScore: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        registrationsCompleted: 342,
        registrationsPending: 56,
        registrationsRejected: 12,
        activeLicenses: 320,
        complianceScore: 88,
      });
    } catch (error) {
      console.error('Error fetching PECU data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Private Education & Compliance Unit</h1>
        <p className="text-muted-foreground mt-2">
          Manage school registrations, licensing, and compliance verification
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.registrationsCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.registrationsPending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.registrationsRejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeLicenses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceScore}%</div>
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
            New Registration
          </Button>
          <Button variant="outline">
            <School className="h-4 w-4 mr-2" />
            View All Schools
          </Button>
          <Button variant="outline">
            <FileCheck className="h-4 w-4 mr-2" />
            Verify Documents
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Compliance Reports
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="registration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registration">School Registration</TabsTrigger>
          <TabsTrigger value="verification">Verification Workflow</TabsTrigger>
          <TabsTrigger value="licensing">Licensing & Certification</TabsTrigger>
          <TabsTrigger value="renewals">Renewal Reminders</TabsTrigger>
          <TabsTrigger value="payments">Payment Verification</TabsTrigger>
          <TabsTrigger value="documents">Document Center</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Private School Registration Portal</CardTitle>
              <CardDescription>Manage school registration applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'REG-2024-001', school: 'Future Leaders Academy', submitted: '2024-01-15', status: 'pending' },
                  { id: 'REG-2024-002', school: 'Excellence International School', submitted: '2024-01-14', status: 'under_review' },
                  { id: 'REG-2024-003', school: 'Bright Minds School', submitted: '2024-01-12', status: 'approved' },
                  { id: 'REG-2024-004', school: 'Knowledge Tree Academy', submitted: '2024-01-10', status: 'rejected' },
                ].map((reg, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-muted-foreground">{reg.id}</span>
                      </div>
                      <h4 className="font-semibold">{reg.school}</h4>
                      <p className="text-sm text-muted-foreground">Submitted: {reg.submitted}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        reg.status === 'approved' ? 'default' :
                        reg.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {reg.status.replace('_', ' ')}
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

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Registration Verification Workflow</CardTitle>
              <CardDescription>Review and verify school registration applications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Verification workflow tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licensing">
          <Card>
            <CardHeader>
              <CardTitle>Licensing & Certification Tracking</CardTitle>
              <CardDescription>Monitor school licenses and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { school: 'Accra International School', license: 'LIC-2023-045', expires: '2025-12-31', status: 'active' },
                  { school: 'Kumasi Private Academy', license: 'LIC-2023-089', expires: '2024-06-30', status: 'expiring_soon' },
                  { school: 'Tamale Education Center', license: 'LIC-2023-102', expires: '2026-03-15', status: 'active' },
                ].map((lic, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{lic.school}</h4>
                      <p className="text-sm text-muted-foreground">License: {lic.license}</p>
                      <p className="text-sm text-muted-foreground">Expires: {lic.expires}</p>
                    </div>
                    <Badge variant={lic.status === 'active' ? 'default' : 'destructive'}>
                      {lic.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals">
          <Card>
            <CardHeader>
              <CardTitle>Automated Renewal Reminders</CardTitle>
              <CardDescription>Manage license renewal notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Renewal reminder system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Verification System</CardTitle>
              <CardDescription>Verify registration and licensing payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment verification tools will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Submission Center</CardTitle>
              <CardDescription>Review submitted documents from schools</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document management system will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
