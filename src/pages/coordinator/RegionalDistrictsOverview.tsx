import { useState, useEffect } from "react";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, School, CheckCircle, XCircle, DollarSign, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface DistrictStats {
  district: string;
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  paidSchools: number;
  unpaidSchools: number;
  complianceRate: number;
}

const RegionalDistrictsOverview = () => {
  const { assignment, error: authError } = useRegionalCoordinatorAuth();
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignment) {
      fetchDistrictStats();
    }
  }, [assignment]);

  const fetchDistrictStats = async () => {
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
            status
          ),
          profiles!inner(
            status
          )
        `)
        .eq("submission_data->>region", assignment.region);

      if (error) throw error;

      // Group by district
      const districtMap: Record<string, DistrictStats> = {};

      schools?.forEach((school: any) => {
        const district = school.submission_data?.district || "Unknown";
        
        if (!districtMap[district]) {
          districtMap[district] = {
            district,
            totalSchools: 0,
            activeSchools: 0,
            inactiveSchools: 0,
            paidSchools: 0,
            unpaidSchools: 0,
            complianceRate: 0,
          };
        }

        districtMap[district].totalSchools++;

        const profile = Array.isArray(school.profiles) ? school.profiles[0] : school.profiles;
        if (profile?.status === "active") {
          districtMap[district].activeSchools++;
        } else {
          districtMap[district].inactiveSchools++;
        }

        const membership = Array.isArray(school.memberships) ? school.memberships[0] : school.memberships;
        if (membership?.payment_status === "paid") {
          districtMap[district].paidSchools++;
        } else {
          districtMap[district].unpaidSchools++;
        }
      });

      // Calculate compliance rates
      Object.values(districtMap).forEach((district) => {
        district.complianceRate =
          district.totalSchools > 0
            ? (district.paidSchools / district.totalSchools) * 100
            : 0;
      });

      setDistrictStats(Object.values(districtMap).sort((a, b) => b.complianceRate - a.complianceRate));

    } catch (error) {
      console.error("Error fetching district stats:", error);
      toast.error("Failed to load district statistics");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">Districts Overview</h1>
        <p className="text-muted-foreground mt-2">
          Performance summary of all districts in {assignment.region} Region
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Districts</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{districtStats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In {assignment.region}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {districtStats.reduce((sum, d) => sum + d.totalSchools, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all districts
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {districtStats.reduce((sum, d) => sum + d.activeSchools, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {districtStats.reduce((sum, d) => sum + d.inactiveSchools, 0)} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Regional Compliance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (districtStats.reduce((sum, d) => sum + d.paidSchools, 0) /
                  districtStats.reduce((sum, d) => sum + d.totalSchools, 0)) *
                100
              ).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment compliance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {districtStats.map((district, index) => (
          <Card key={district.district} className="hover-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{district.district}</CardTitle>
                  <CardDescription>
                    Rank #{index + 1} by compliance
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{district.complianceRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Payment Compliance</span>
                  <span className="font-medium">{district.complianceRate.toFixed(1)}%</span>
                </div>
                <Progress value={district.complianceRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Schools</span>
                  </div>
                  <p className="text-2xl font-bold">{district.totalSchools}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{district.activeSchools}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Paid</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{district.paidSchools}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Unpaid</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{district.unpaidSchools}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {districtStats.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No district data available
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegionalDistrictsOverview;
