import { useState, useEffect } from "react";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface ReportStats {
  totalSchools: number;
  totalDistricts: number;
  activeSchools: number;
  paidSchools: number;
  totalRevenue: number;
  complianceRate: number;
}

const RegionalReportsPage = () => {
  const { assignment, error: authError } = useRegionalCoordinatorAuth();
  const [stats, setStats] = useState<ReportStats>({
    totalSchools: 0,
    totalDistricts: 0,
    activeSchools: 0,
    paidSchools: 0,
    totalRevenue: 0,
    complianceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignment) {
      fetchReportData();
    }
  }, [assignment]);

  const fetchReportData = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      const { data: schools, error } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          memberships!inner(
            payment_status,
            amount
          ),
          profiles!inner(
            status
          )
        `)
        .eq("submission_data->>region", assignment.region);

      if (error) throw error;

      const total = schools?.length || 0;
      const active = schools?.filter((s: any) => {
        const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        return profile?.status === "active";
      }).length || 0;
      
      const paid = schools?.filter((s: any) => {
        const membership = Array.isArray(s.memberships) ? s.memberships[0] : s.memberships;
        return membership?.payment_status === "paid";
      }).length || 0;

      const revenue = schools?.reduce((sum: number, s: any) => {
        const membership = Array.isArray(s.memberships) ? s.memberships[0] : s.memberships;
        if (membership?.payment_status === "paid") {
          return sum + (membership.amount || 0);
        }
        return sum;
      }, 0) || 0;

      const districts = new Set(
        schools?.map((s: any) => s.submission_data?.district).filter(Boolean)
      );

      setStats({
        totalSchools: total,
        totalDistricts: districts.size,
        activeSchools: active,
        paidSchools: paid,
        totalRevenue: revenue,
        complianceRate: total > 0 ? (paid / total) * 100 : 0,
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportType: string) => {
    toast.info(`Downloading ${reportType} report...`);
    // Report generation logic would go here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-semibold">
          {authError || 'No regional assignment found'}
        </p>
        <p className="text-sm text-muted-foreground">Please contact an administrator</p>
      </div>
    );
  }

  const reports = [
    {
      title: "Regional Summary Report",
      description: "Complete overview of all schools, districts, and performance metrics",
      icon: BarChart3,
      type: "regional-summary",
    },
    {
      title: "District Comparison Report",
      description: "Side-by-side comparison of all districts in the region",
      icon: FileText,
      type: "district-comparison",
    },
    {
      title: "Payment Compliance Report",
      description: "Detailed payment status and compliance rates by district",
      icon: FileText,
      type: "payment-compliance",
    },
    {
      title: "School Registration Report",
      description: "New registrations, updates, and pending verifications",
      icon: FileText,
      type: "registration",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">Regional Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and download reports for {assignment.region} Region
        </p>
      </div>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Regional Statistics</CardTitle>
          <CardDescription>Current region-wide metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Schools</p>
              <p className="text-2xl font-bold">{stats.totalSchools}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Districts</p>
              <p className="text-2xl font-bold">{stats.totalDistricts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Schools</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSchools}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Schools</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidSchools}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">GHS {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compliance Rate</p>
              <p className="text-2xl font-bold">{stats.complianceRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.type} className="hover-glow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadReport(report.type)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReport(report.type)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RegionalReportsPage;
