import { useState, useEffect } from "react";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, School, DollarSign, CheckCircle, TrendingUp, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardStats {
  totalSchools: number;
  totalDistricts: number;
  activeSchools: number;
  inactiveSchools: number;
  paidSchools: number;
  unpaidSchools: number;
}

interface DistrictStats {
  district: string;
  totalSchools: number;
  activeSchools: number;
  paidSchools: number;
}

const RegionalDashboardHome = () => {
  const { assignment, error: assignmentError } = useRegionalCoordinatorAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalDistricts: 0,
    activeSchools: 0,
    inactiveSchools: 0,
    paidSchools: 0,
    unpaidSchools: 0,
  });
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
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

      // Fetch all schools in the region
      const { data: schools, error: schoolsError } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          memberships!inner(
            payment_status,
            status
          ),
          profiles!inner(
            status,
            paid_until
          )
        `)
        .eq("submission_data->>region", assignment.region);

      if (schoolsError) throw schoolsError;

      const total = schools?.length || 0;
      const active = schools?.filter((s: any) => {
        const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        return profile?.status === 'active';
      }).length || 0;
      const inactive = total - active;

      const paid = schools?.filter((s: any) => {
        const membership = Array.isArray(s.memberships) ? s.memberships[0] : s.memberships;
        return membership?.payment_status === 'paid';
      }).length || 0;
      const unpaid = total - paid;

      // Calculate district breakdown
      const districtMap: Record<string, DistrictStats> = {};
      schools?.forEach((school: any) => {
        const schoolData = school.submission_data as any;
        const district = schoolData?.district || "Unknown";
        
        if (!districtMap[district]) {
          districtMap[district] = {
            district,
            totalSchools: 0,
            activeSchools: 0,
            paidSchools: 0,
          };
        }

        districtMap[district].totalSchools++;
        
        const profile = Array.isArray(school.profiles) ? school.profiles[0] : school.profiles;
        if (profile?.status === 'active') {
          districtMap[district].activeSchools++;
        }

        const membership = Array.isArray(school.memberships) ? school.memberships[0] : school.memberships;
        if (membership?.payment_status === 'paid') {
          districtMap[district].paidSchools++;
        }
      });

      setStats({
        totalSchools: total,
        totalDistricts: Object.keys(districtMap).length,
        activeSchools: active,
        inactiveSchools: inactive,
        paidSchools: paid,
        unpaidSchools: unpaid,
      });

      setDistrictStats(Object.values(districtMap));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

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
          {assignmentError || 'No regional assignment found'}
        </p>
        <p className="text-sm text-muted-foreground">Please contact an administrator to assign you to a region</p>
      </div>
    );
  }

  const paymentData = [
    { name: 'Paid', value: stats.paidSchools, color: '#22c55e' },
    { name: 'Unpaid', value: stats.unpaidSchools, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">Regional Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitoring all schools in <span className="font-semibold">{assignment.region}</span> Region
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
              Across {stats.totalDistricts} districts
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
              {stats.inactiveSchools} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Schools</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidSchools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.paidSchools / stats.totalSchools) * 100).toFixed(1)}% compliance
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Districts</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistricts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In {assignment.region} region
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Performance */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>District Performance</CardTitle>
            <CardDescription>Schools by district</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalSchools" fill="hsl(var(--primary))" name="Total" />
                <Bar dataKey="activeSchools" fill="hsl(var(--success))" name="Active" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Payment Compliance</CardTitle>
            <CardDescription>Regional payment status</CardDescription>
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
                  outerRadius={80}
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

      {/* District Rankings */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>District Rankings</CardTitle>
          <CardDescription>Top performing districts by compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {districtStats
              .sort((a, b) => (b.paidSchools / b.totalSchools) - (a.paidSchools / a.totalSchools))
              .slice(0, 5)
              .map((district, index) => (
                <div key={district.district} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                    <div>
                      <p className="font-semibold">{district.district}</p>
                      <p className="text-sm text-muted-foreground">
                        {district.totalSchools} schools
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {((district.paidSchools / district.totalSchools) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Payment compliance</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalDashboardHome;