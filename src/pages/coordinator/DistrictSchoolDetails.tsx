import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, FileText, DollarSign, CheckCircle } from "lucide-react";
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

const DistrictSchoolDetails = () => {
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

      // Fetch school details
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

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("membership_id", schoolData.memberships.gnacops_id)
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
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            School not found.
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate('/coordinator/district/schools')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schools List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const submissionData = school.submission_data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/coordinator/district/schools')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools List
          </Button>
          <h1 className="text-3xl font-bold text-gradient-accent">
            {submissionData.schoolName || "School Details"}
          </h1>
          <p className="text-muted-foreground mt-2">
            GNACOPS Code: {school.memberships.gnacops_id}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-right">
          {getStatusBadge(school.profiles.status)}
          {getPaymentBadge(school.memberships.payment_status)}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="form">Institutional Form</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* School Profile Tab */}
        <TabsContent value="profile">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>School Profile Information</CardTitle>
              <CardDescription>Basic information about the institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School Name</p>
                  <p className="text-lg">{submissionData.schoolName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-lg">{submissionData.category || "Institutional Membership"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Region</p>
                  <p className="text-lg">{submissionData.region || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">District</p>
                  <p className="text-lg">{submissionData.district || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                  <p className="text-lg">{school.profiles.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{school.profiles.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{school.profiles.phone || submissionData.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ownership Type</p>
                  <p className="text-lg">{submissionData.ownershipType || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Institutional Form Tab */}
        <TabsContent value="form">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Complete Institutional Form Data</CardTitle>
              <CardDescription>All submitted information from registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* School Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">School Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">RGD Number</p>
                    <p>{submissionData.rgdNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Establishment Date</p>
                    <p>{submissionData.establishmentDate || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{submissionData.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Digital Address</p>
                    <p>{submissionData.digitalAddress || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Ownership Details */}
              {submissionData.ownerName && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ownership Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                      <p>{submissionData.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner Contact</p>
                      <p>{submissionData.ownerContact || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Headteacher Details */}
              {submissionData.headteacherName && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Headteacher Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{submissionData.headteacherName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact</p>
                      <p>{submissionData.headteacherContact || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enrollment & Staff */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Enrollment & Staff</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p>{submissionData.totalStudents || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teaching Staff</p>
                    <p>{submissionData.teachingStaff || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Non-Teaching Staff</p>
                    <p>{submissionData.nonTeachingStaff || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Vision & Mission */}
              {(submissionData.vision || submissionData.mission) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Vision & Mission</h3>
                  {submissionData.vision && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground">Vision</p>
                      <p className="text-sm">{submissionData.vision}</p>
                    </div>
                  )}
                  {submissionData.mission && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mission</p>
                      <p className="text-sm">{submissionData.mission}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Complete payment records for this school</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground">Last Payment</p>
                    <p className="text-lg font-bold">
                      {school.profiles.last_payment_at 
                        ? new Date(school.profiles.last_payment_at).toLocaleDateString()
                        : "Never"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
                    <p className="text-lg font-bold">
                      {school.profiles.paid_until 
                        ? new Date(school.profiles.paid_until).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                    <div className="mt-1">
                      {getPaymentBadge(school.memberships.payment_status)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Transactions */}
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No payment records found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          GH₵ {payment.amount}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.paystack_reference || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getPaymentBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          {payment.payment_method || "Paystack"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Compliance & Status</CardTitle>
              <CardDescription>Current compliance information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Registration Status</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(school.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(school.memberships.status)}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Payment Compliance</p>
                    <p className="text-sm text-muted-foreground">
                      {school.profiles.paid_until 
                        ? `Valid until ${new Date(school.profiles.paid_until).toLocaleDateString()}`
                        : "No active payment"}
                    </p>
                  </div>
                </div>
                {getPaymentBadge(school.memberships.payment_status)}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Form Submission</p>
                    <p className="text-sm text-muted-foreground">
                      Complete institutional form submitted
                    </p>
                  </div>
                </div>
                <Badge variant="default">Complete</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DistrictSchoolDetails;
