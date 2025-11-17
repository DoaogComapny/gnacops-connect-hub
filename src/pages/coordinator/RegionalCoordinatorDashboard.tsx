import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, School, DollarSign, Calendar, FileText, Users, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDistrictsByRegion } from "@/data/ghanaRegions";

interface Assignment {
  region: string;
}

interface Institution {
  id: string;
  submission_data: any;
  submitted_at: string;
  memberships: {
    gnacops_id: string;
    status: string;
  };
}

const RegionalCoordinatorDashboard = () => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [districtStats, setDistrictStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [user]);

  useEffect(() => {
    if (assignment) {
      fetchDashboardData();
    }
  }, [assignment]);

  const fetchAssignment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("staff_assignments")
        .select("region")
        .eq("user_id", user.id)
        .eq("role", "regional_coordinator")
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      toast.error("Failed to load assignment");
    }
  };

  const fetchDashboardData = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      // Fetch all institutions from the region
      const { data: institutionsData, error: instError } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          submitted_at,
          memberships!inner(gnacops_id, status)
        `)
        .filter("submission_data->>region", "eq", assignment.region);

      if (instError) throw instError;

      setInstitutions(institutionsData || []);

      // Calculate district stats
      const stats: Record<string, number> = {};
      (institutionsData || []).forEach((inst) => {
        const submissionData = inst.submission_data as any;
        const district = submissionData?.district;
        if (district) {
          stats[district] = (stats[district] || 0) + 1;
        }
      });
      setDistrictStats(stats);

      // Fetch payments for institutions in this region
      const membershipIds = (institutionsData || []).map(i => i.memberships.gnacops_id);

      if (membershipIds.length > 0) {
        const { data: paymentsData, error: payError } = await supabase
          .from("payments")
          .select("*, memberships(*), profiles(*)")
          .in("membership_id", membershipIds);

        if (payError) throw payError;
        setPayments(paymentsData || []);
      }

      // Fetch appointments
      const { data: appointmentsData, error: appError } = await supabase
        .from("appointments")
        .select("*, profiles(*)")
        .order("appointment_date", { ascending: false })
        .limit(20);

      if (appError) throw appError;
      setAppointments(appointmentsData || []);

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

  if (!assignment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No regional assignment found. Please contact the administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalInstitutions = institutions.length;
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const districts = getDistrictsByRegion(assignment.region);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Regional Coordinator Dashboard</h1>
        <p className="text-muted-foreground">{assignment.region} Region</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstitutions}</div>
            <p className="text-xs text-muted-foreground">Across all districts</p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(districtStats).length}</div>
            <p className="text-xs text-muted-foreground">Out of {districts.length} total</p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵ {totalPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {payments.length} payments</p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* District Breakdown */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>District Breakdown</CardTitle>
          <CardDescription>Institutions per district in {assignment.region}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(districtStats)
              .sort(([, a], [, b]) => b - a)
              .map(([district, count]) => (
                <Card key={district} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{district}</p>
                        <p className="text-xs text-muted-foreground">District</p>
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Data */}
      <Tabs defaultValue="institutions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="institutions">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>All Institutions in {assignment.region}</CardTitle>
              <CardDescription>Complete list of registered institutions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>GNACOPS ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No institutions found in this region
                      </TableCell>
                    </TableRow>
                  ) : (
                    institutions.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">
                          {inst.submission_data?.schoolName || "N/A"}
                        </TableCell>
                        <TableCell>{inst.submission_data?.district || "N/A"}</TableCell>
                        <TableCell>{inst.memberships.gnacops_id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={inst.memberships.status === "active" ? "default" : "secondary"}
                          >
                            {inst.memberships.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(inst.submitted_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>Payment records from {assignment.region}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>GH₵ {parseFloat(payment.amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "success" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest appointment bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell className="capitalize">{appointment.appointment_type}</TableCell>
                        <TableCell>
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              appointment.status === "approved"
                                ? "default"
                                : appointment.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionalCoordinatorDashboard;
