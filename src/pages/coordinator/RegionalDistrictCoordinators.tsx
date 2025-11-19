import { useState, useEffect } from "react";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

interface DistrictCoordinator {
  user_id: string;
  district: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  schoolCount?: number;
}

const RegionalDistrictCoordinators = () => {
  const { assignment, error: authError } = useRegionalCoordinatorAuth();
  const [coordinators, setCoordinators] = useState<DistrictCoordinator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignment) {
      fetchCoordinators();
    }
  }, [assignment]);

  const fetchCoordinators = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      // Fetch district coordinators in this region
      const { data: coordData, error: coordError } = await supabase
        .from("staff_assignments")
        .select(`
          user_id,
          district,
          created_at
        `)
        .eq("role", "district_coordinator")
        .eq("region", assignment.region);

      if (coordError) throw coordError;

      // Fetch profiles separately
      const userIds = coordData?.map(c => c.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      const coordsWithProfiles = coordData?.map(coord => ({
        ...coord,
        profiles: profilesMap.get(coord.user_id) || { full_name: "", email: "", phone: "" }
      })) || [];

      // For each coordinator, count their schools
      const coordinatorsWithCounts = await Promise.all(
        coordsWithProfiles.map(async (coord) => {
          const { count } = await supabase
            .from("form_submissions")
            .select("*", { count: "exact", head: true })
            .eq("submission_data->>region", assignment.region)
            .eq("submission_data->>district", coord.district);

          return {
            ...coord,
            schoolCount: count || 0,
          };
        })
      );

      setCoordinators(coordinatorsWithCounts);

    } catch (error) {
      console.error("Error fetching coordinators:", error);
      toast.error("Failed to load district coordinators");
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
        <h1 className="text-3xl font-bold text-gradient-accent">District Coordinators</h1>
        <p className="text-muted-foreground mt-2">
          All district coordinators in {assignment.region} Region
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Coordinators</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinators.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all districts
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(coordinators.map((c) => c.district)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In {assignment.region}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coordinators.reduce((sum, c) => sum + (c.schoolCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Under coordination
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>District Coordinators Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Schools</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coordinators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No district coordinators found
                    </TableCell>
                  </TableRow>
                ) : (
                  coordinators.map((coord) => {
                    const profile = Array.isArray(coord.profiles) ? coord.profiles[0] : coord.profiles;
                    
                    return (
                      <TableRow key={coord.user_id}>
                        <TableCell className="font-medium">
                          {profile?.full_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {coord.district || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {profile?.email || "N/A"}
                            </div>
                            {profile?.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {profile.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {coord.schoolCount || 0} schools
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalDistrictCoordinators;
