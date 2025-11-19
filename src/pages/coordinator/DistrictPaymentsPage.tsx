import { useState, useEffect } from "react";
import { useDistrictCoordinatorAuth } from "@/hooks/useDistrictCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Assignment {
  region: string;
  district: string;
}

interface PaymentRecord {
  school_id: string;
  school_name: string;
  gnacops_id: string;
  last_payment: string | null;
  expiry_date: string | null;
  payment_status: string;
  amount: number | null;
  status: string;
}

const DistrictPaymentsPage = () => {
  const { user, assignment, error: assignmentError } = useDistrictCoordinatorAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignment) {
      fetchPayments();
    }
  }, [assignment]);

  const fetchPayments = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          memberships!inner(
            gnacops_id,
            payment_status,
            id
          ),
          profiles!inner(
            paid_until,
            last_payment_at,
            status
          )
        `)
        .filter("submission_data->>region", "eq", assignment.region)
        .filter("submission_data->>district", "eq", assignment.district);

      if (error) throw error;

      // Fetch latest payments for each membership
      const paymentsWithDetails: PaymentRecord[] = await Promise.all(
        (data || []).map(async (school: any) => {
          const { data: paymentData } = await supabase
            .from("payments")
            .select("amount, created_at, status")
            .eq("membership_id", school.memberships.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            school_id: school.id,
            school_name: school.submission_data?.schoolName || "N/A",
            gnacops_id: school.memberships.gnacops_id,
            last_payment: school.profiles.last_payment_at,
            expiry_date: school.profiles.paid_until,
            payment_status: school.memberships.payment_status,
            amount: paymentData?.amount || null,
            status: school.profiles.status,
          };
        })
      );

      setPayments(paymentsWithDetails);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      paid: { variant: "default", label: "Paid" },
      unpaid: { variant: "destructive", label: "Unpaid" },
      pending: { variant: "secondary", label: "Pending" },
    };

    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return diff;
  };

  const filterPayments = (type: 'all' | 'active' | 'expired' | 'due_soon' | 'overdue') => {
    const now = new Date();

    switch (type) {
      case 'all':
        return payments;
      case 'active':
        return payments.filter(p => p.status === 'active');
      case 'expired':
        return payments.filter(p => p.status === 'expired');
      case 'due_soon':
        return payments.filter(p => {
          const days = getDaysUntilExpiry(p.expiry_date);
          return days !== null && days > 0 && days <= 30;
        });
      case 'overdue':
        return payments.filter(p => {
          const days = getDaysUntilExpiry(p.expiry_date);
          return days !== null && days < 0;
        });
      default:
        return payments;
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
          {assignmentError || 'No district assignment found'}
        </p>
        <p className="text-sm text-muted-foreground">Please contact an administrator to assign you to a district</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">Payments & Renewals</h1>
        <p className="text-muted-foreground mt-2">
          Payment tracking for {assignment.district}, {assignment.region}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterPayments('active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterPayments('due_soon').length}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterPayments('overdue').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="hover-glow">
        <Tabs defaultValue="all" className="w-full">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="all">All ({payments.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({filterPayments('active').length})</TabsTrigger>
              <TabsTrigger value="due_soon">Due Soon ({filterPayments('due_soon').length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({filterPayments('overdue').length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({filterPayments('expired').length})</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {['all', 'active', 'due_soon', 'overdue', 'expired'].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue}>
                {filterPayments(tabValue as any).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No records in this category.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>School Name</TableHead>
                          <TableHead>GNACOPS Code</TableHead>
                          <TableHead>Last Payment</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Days Left</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterPayments(tabValue as any).map((payment) => {
                          const daysLeft = getDaysUntilExpiry(payment.expiry_date);
                          return (
                            <TableRow key={payment.school_id}>
                              <TableCell className="font-medium">{payment.school_name}</TableCell>
                              <TableCell>{payment.gnacops_id}</TableCell>
                              <TableCell>
                                {payment.last_payment 
                                  ? new Date(payment.last_payment).toLocaleDateString()
                                  : "Never"}
                              </TableCell>
                              <TableCell>
                                {payment.amount ? `GH₵ ${payment.amount}` : "N/A"}
                              </TableCell>
                              <TableCell>
                                {payment.expiry_date 
                                  ? new Date(payment.expiry_date).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {daysLeft !== null ? (
                                  <Badge variant={
                                    daysLeft < 0 ? "destructive" :
                                    daysLeft <= 30 ? "secondary" : "default"
                                  }>
                                    {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                                  </Badge>
                                ) : "N/A"}
                              </TableCell>
                              <TableCell>
                                {getPaymentBadge(payment.payment_status)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/coordinator/district/school/${payment.school_id}`)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default DistrictPaymentsPage;
