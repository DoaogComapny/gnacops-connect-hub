import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, School, DollarSign, Calendar, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Assignment {
  region: string;
  district: string;
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

const DistrictCoordinatorDashboard = () => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
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

  const fetchDashboardData = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      // Fetch institutions from the district (from form submissions)
      const { data: institutionsData, error: instError } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          submitted_at,
          memberships!inner(gnacops_id, status)
        `)
        .filter("submission_data->>region", "eq", assignment.region)
        .filter("submission_data->>district", "eq", assignment.district);

      if (instError) throw instError;

      setInstitutions(institutionsData || []);

      // Fetch payments for institutions in this district
      const membershipIds = (institutionsData || []).map(i => i.memberships.gnacops_id);

      if (membershipIds.length > 0) {
        const { data: paymentsData, error: payError } = await supabase
          .from("payments")
          .select("*, memberships(*), profiles(*)")
          .in("membership_id", membershipIds);

        if (payError) throw payError;
        setPayments(paymentsData || []);
      }

      // Fetch appointments related to this district
      const { data: appointmentsData, error: appError } = await supabase
        .from("appointments")
        .select("*, profiles(*)")
        .order("appointment_date", { ascending: false })
        .limit(10);

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
              No district assignment found. Please contact the administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalInstitutions = institutions.length;
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">District Coordinator Dashboard</h1>
        <p className="text-muted-foreground">
          {assignment.district}, {assignment.region}
        </p>
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
            <p className="text-xs text-muted-foreground">In your district</p>
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

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Memberships</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {institutions.filter(i => i.memberships.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Current active</p>
          </CardContent>
        </Card>
      </div>

      {/* Institutions Table */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Institutions in {assignment.district}</CardTitle>
          <CardDescription>All registered institutions in your district</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution Name</TableHead>
                <TableHead>GNACOPS ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No institutions found in this district
                  </TableCell>
                </TableRow>
              ) : (
                institutions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">
                      {inst.submission_data?.schoolName || "N/A"}
                    </TableCell>
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

      {/* Recent Payments */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payments from institutions in your district</CardDescription>
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
                payments.slice(0, 10).map((payment) => (
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
    </div>
  );
};

export default DistrictCoordinatorDashboard;
