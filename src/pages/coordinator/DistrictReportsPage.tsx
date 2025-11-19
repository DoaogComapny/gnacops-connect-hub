import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Assignment {
  region: string;
  district: string;
}

interface ReportData {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  paidSchools: number;
  unpaidSchools: number;
  categoryBreakdown: Record<string, number>;
  paymentCompliance: number;
}

const DistrictReportsPage = () => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [reportData, setReportData] = useState<ReportData>({
    totalSchools: 0,
    activeSchools: 0,
    inactiveSchools: 0,
    paidSchools: 0,
    unpaidSchools: 0,
    categoryBreakdown: {},
    paymentCompliance: 0,
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [user]);

  useEffect(() => {
    if (assignment) {
      fetchReportData();
    }
  }, [assignment]);

  const fetchAssignment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("staff_assignments")
        .select("region, district")
        .eq("user_id", user.id)
        .eq("role", "district_coordinator")
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      toast.error("Failed to load assignment");
    }
  };

  const fetchReportData = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          submitted_at,
          memberships!inner(
            gnacops_id,
            status,
            payment_status
          ),
          profiles!inner(
            status,
            paid_until
          )
        `)
        .filter("submission_data->>region", "eq", assignment.region)
        .filter("submission_data->>district", "eq", assignment.district);

      if (error) throw error;

      setSchools(data || []);

      // Calculate statistics
      const total = data?.length || 0;
      const active = data?.filter((s: any) => s.profiles.status === 'active').length || 0;
      const inactive = total - active;
      const paid = data?.filter((s: any) => s.memberships.payment_status === 'paid').length || 0;
      const unpaid = total - paid;

      // Category breakdown
      const categories: Record<string, number> = {};
      data?.forEach((school: any) => {
        const category = school.submission_data?.category || 'Institutional Membership';
        categories[category] = (categories[category] || 0) + 1;
      });

      setReportData({
        totalSchools: total,
        activeSchools: active,
        inactiveSchools: inactive,
        paidSchools: paid,
        unpaidSchools: unpaid,
        categoryBreakdown: categories,
        paymentCompliance: total > 0 ? Math.round((paid / total) * 100) : 0,
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (type: 'summary' | 'detailed') => {
    if (!assignment) return;

    try {
      let csvContent = "";

      if (type === 'summary') {
        csvContent = "District Summary Report\n";
        csvContent += `District,${assignment.district}\n`;
        csvContent += `Region,${assignment.region}\n`;
        csvContent += `Generated,${new Date().toLocaleString()}\n\n`;
        csvContent += "Metric,Value\n";
        csvContent += `Total Schools,${reportData.totalSchools}\n`;
        csvContent += `Active Schools,${reportData.activeSchools}\n`;
        csvContent += `Inactive Schools,${reportData.inactiveSchools}\n`;
        csvContent += `Paid Schools,${reportData.paidSchools}\n`;
        csvContent += `Unpaid Schools,${reportData.unpaidSchools}\n`;
        csvContent += `Payment Compliance,${reportData.paymentCompliance}%\n\n`;
        
        csvContent += "Category Breakdown\n";
        csvContent += "Category,Count\n";
        Object.entries(reportData.categoryBreakdown).forEach(([cat, count]) => {
          csvContent += `${cat},${count}\n`;
        });
      } else {
        csvContent = "School,GNACOPS Code,Category,Status,Payment Status,Submitted Date\n";
        schools.forEach((school: any) => {
          csvContent += `"${school.submission_data?.schoolName || 'N/A'}",`;
          csvContent += `${school.memberships.gnacops_id},`;
          csvContent += `${school.submission_data?.category || 'Institutional'},`;
          csvContent += `${school.profiles.status},`;
          csvContent += `${school.memberships.payment_status},`;
          csvContent += `${new Date(school.submitted_at).toLocaleDateString()}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `district_report_${type}_${assignment.district}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${type === 'summary' ? 'Summary' : 'Detailed'} report downloaded`);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No district assignment found. Please contact admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">District Reports</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive reports for {assignment.district}, {assignment.region}
        </p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary Report</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
        </TabsList>

        {/* Summary Report Tab */}
        <TabsContent value="summary">
          <div className="space-y-6">
            {/* Summary Statistics */}
            <Card className="hover-glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>District Summary Report</CardTitle>
                  <CardDescription>
                    Overview of all schools in {assignment.district}
                  </CardDescription>
                </div>
                <Button onClick={() => downloadCSV('summary')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Schools */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium">Total Schools</p>
                    </div>
                    <p className="text-3xl font-bold">{reportData.totalSchools}</p>
                  </div>

                  {/* Active/Inactive Breakdown */}
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-3">Registration Status</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <span className="font-semibold">{reportData.activeSchools}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Inactive</span>
                        <span className="font-semibold">{reportData.inactiveSchools}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-3">Payment Status</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Paid</span>
                        <span className="font-semibold text-green-600">{reportData.paidSchools}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Unpaid</span>
                        <span className="font-semibold text-red-600">{reportData.unpaidSchools}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Compliance Rate</span>
                        <span className="font-bold">{reportData.paymentCompliance}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Schools by membership category</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(reportData.categoryBreakdown).map(([category, count]) => (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>
                          {reportData.totalSchools > 0
                            ? `${Math.round((count / reportData.totalSchools) * 100)}%`
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Report Tab */}
        <TabsContent value="detailed">
          <Card className="hover-glow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Detailed School List</CardTitle>
                <CardDescription>
                  Complete list of all schools with full details
                </CardDescription>
              </div>
              <Button onClick={() => downloadCSV('detailed')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </CardHeader>
            <CardContent>
              {schools.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No schools found in this district.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>GNACOPS Code</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Submitted Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schools.map((school: any) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium">
                            {school.submission_data?.schoolName || "N/A"}
                          </TableCell>
                          <TableCell>{school.memberships.gnacops_id}</TableCell>
                          <TableCell>
                            {school.submission_data?.category || "Institutional"}
                          </TableCell>
                          <TableCell>{school.profiles.status}</TableCell>
                          <TableCell>{school.memberships.payment_status}</TableCell>
                          <TableCell>
                            {new Date(school.submitted_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DistrictReportsPage;
