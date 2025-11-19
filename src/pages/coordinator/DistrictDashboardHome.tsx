import { useState, useEffect } from "react";
import { useDistrictCoordinatorAuth } from "@/hooks/useDistrictCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, School, DollarSign, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Assignment {
  region: string;
  district: string;
}

interface DashboardStats {
  totalSchools: number;
  pendingRenewals: number;
  activeSchools: number;
  inactiveSchools: number;
  newSchools: number;
  paidSchools: number;
  unpaidSchools: number;
}

const DistrictDashboardHome = () => {
  const { user, assignment, error: assignmentError } = useDistrictCoordinatorAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    pendingRenewals: 0,
    activeSchools: 0,
    inactiveSchools: 0,
    newSchools: 0,
    paidSchools: 0,
    unpaidSchools: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignment) {
      fetchDashboardData();
    }
  }, [assignment]);

  const fetchDashboardData = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      // Fetch all institutions from the district
      const { data: institutions, error: instError } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          submitted_at,
          user_id,
          memberships!inner(
            id,
            gnacops_id,
            status,
            payment_status,
            created_at,
            updated_at
          ),
          profiles!inner(
            paid_until,
            status
          )
        `)
        .filter("submission_data->>region", "eq", assignment.region)
        .filter("submission_data->>district", "eq", assignment.district);

      if (instError) throw instError;

      // Calculate statistics
      const total = institutions?.length || 0;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const active = institutions?.filter((i: any) => 
        i.profiles?.status === 'active'
      ).length || 0;

      const inactive = total - active;

      const newSchools = institutions?.filter((i: any) => 
        new Date(i.submitted_at) > thirtyDaysAgo
      ).length || 0;

      const paid = institutions?.filter((i: any) => 
        i.memberships?.payment_status === 'paid'
      ).length || 0;

      const unpaid = total - paid;

      const pending = institutions?.filter((i: any) => {
        const paidUntil = i.profiles?.paid_until;
        if (!paidUntil) return false;
        const expiryDate = new Date(paidUntil);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }).length || 0;

      setStats({
        totalSchools: total,
        pendingRenewals: pending,
        activeSchools: active,
        inactiveSchools: inactive,
        newSchools,
        paidSchools: paid,
        unpaidSchools: unpaid,
      });

      // Calculate monthly registration data (last 6 months)
      const monthlyRegistrations: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

      institutions?.forEach((inst: any) => {
        const submittedDate = new Date(inst.submitted_at);
        if (submittedDate > sixMonthsAgo) {
          const monthKey = `${months[submittedDate.getMonth()]} ${submittedDate.getFullYear()}`;
          monthlyRegistrations[monthKey] = (monthlyRegistrations[monthKey] || 0) + 1;
        }
      });

      const chartData = Object.entries(monthlyRegistrations)
        .map(([month, count]) => ({ month, count }))
        .slice(-6);

      setMonthlyData(chartData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const paymentData = [
    { name: 'Paid', value: stats.paidSchools, color: '#22c55e' },
    { name: 'Unpaid', value: stats.unpaidSchools, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-semibold">
          {assignmentError || 'No district assignment found'}
        </p>
        <p className="text-sm text-muted-foreground">Please contact an administrator to assign you to a district</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitoring schools in <span className="font-semibold">{assignment.district}, {assignment.region}</span>
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your district
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Renewals</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRenewals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Due in next 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSchools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fully compliant
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Schools</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newSchools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Growth Chart */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Registration Growth</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Completion Chart */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Current payment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/coordinator/district/schools')}>
            <School className="h-4 w-4 mr-2" />
            View All Schools
          </Button>
          <Button variant="outline" onClick={() => navigate('/coordinator/district/payments')}>
            <DollarSign className="h-4 w-4 mr-2" />
            View Pending Renewals
          </Button>
          <Button variant="outline" onClick={() => navigate('/coordinator/district/reports')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate District Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistrictDashboardHome;
