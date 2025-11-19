import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SchoolData {
  id: string;
  submission_data: any;
  submitted_at: string;
  memberships: {
    gnacops_id: string;
    status: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
  };
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    status: string;
    paid_until: string;
    last_payment_at: string;
  };
}

const RegionalSchoolDetails = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolDetails();
    }
  }, [schoolId]);

  const fetchSchoolDetails = async () => {
    try {
      setLoading(true);

      const { data: schoolData, error: schoolError } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          submitted_at,
          memberships!inner(
            gnacops_id,
            status,
            payment_status,
            created_at,
            updated_at
          ),
          profiles!inner(
            full_name,
            email,
            phone,
            status,
            paid_until,
            last_payment_at
          )
        `)
        .eq("id", schoolId)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      const membership = Array.isArray(schoolData.memberships) ? schoolData.memberships[0] : schoolData.memberships;
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("membership_id", membership.gnacops_id)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

    } catch (error) {
      console.error("Error fetching school details:", error);
      toast.error("Failed to load school details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      pending_payment: { variant: "secondary", label: "Pending Payment" },
      expired: { variant: "destructive", label: "Expired" },
      inactive: { variant: "outline", label: "Inactive" },
    };
    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      paid: { variant: "default", label: "Paid" },
      unpaid: { variant: "destructive", label: "Unpaid" },
      pending: { variant: "secondary", label: "Pending" },
      success: { variant: "default", label: "Success" },
    };
    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-semibold">School not found</p>
        <Button onClick={() => navigate("/coordinator/regional/schools")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
      </div>
    );
  }

  const data = school.submission_data;
  const membership = Array.isArray(school.memberships) ? school.memberships[0] : school.memberships;
  const profile = Array.isArray(school.profiles) ? school.profiles[0] : school.profiles;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/coordinator/regional/schools")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gradient-accent">{data?.schoolName || "School Details"}</h1>
          <p className="text-muted-foreground mt-1">{data?.district}, {data?.region}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">GNACOPS Code</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-lg font-bold">{membership?.gnacops_id || "N/A"}</code>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(profile?.status || "unknown")}
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getPaymentBadge(membership?.payment_status || "unknown")}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">School Details</TabsTrigger>
          <TabsTrigger value="contact">Contact Information</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Institution Information</CardTitle>
              <CardDescription>Basic school details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Name</p>
                  <p className="font-medium">{data?.schoolName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium">{data?.region || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">{data?.district || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{data?.schoolCategory || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">
                    {school.submitted_at
                      ? new Date(school.submitted_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {membership?.updated_at
                      ? new Date(membership.updated_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>School contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{profile?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile?.phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No payment history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {payment.currency} {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_method || "N/A"}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{payment.paystack_reference || "N/A"}</code>
                        </TableCell>
                        <TableCell>{getPaymentBadge(payment.status)}</TableCell>
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

export default RegionalSchoolDetails;
