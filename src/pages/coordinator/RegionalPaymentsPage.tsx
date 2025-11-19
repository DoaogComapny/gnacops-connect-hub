import { useState, useEffect } from "react";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentData {
  schoolName: string;
  district: string;
  gnacopsId: string;
  lastPayment: string | null;
  paidUntil: string | null;
  paymentStatus: string;
  amount: number;
}

const RegionalPaymentsPage = () => {
  const { assignment, error: authError } = useRegionalCoordinatorAuth();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (assignment) {
      fetchPayments();
    }
  }, [assignment]);

  useEffect(() => {
    applyFilters();
  }, [payments, districtFilter, statusFilter]);

  const fetchPayments = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          submission_data,
          memberships!inner(
            gnacops_id,
            payment_status,
            amount
          ),
          profiles!inner(
            paid_until,
            last_payment_at
          )
        `)
        .eq("submission_data->>region", assignment.region);

      if (error) throw error;

      const paymentsData: PaymentData[] = (data || []).map((item: any) => {
        const membership = Array.isArray(item.memberships) ? item.memberships[0] : item.memberships;
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        
        return {
          schoolName: item.submission_data?.schoolName || "N/A",
          district: item.submission_data?.district || "N/A",
          gnacopsId: membership?.gnacops_id || "N/A",
          lastPayment: profile?.last_payment_at,
          paidUntil: profile?.paid_until,
          paymentStatus: membership?.payment_status || "unknown",
          amount: membership?.amount || 0,
        };
      });

      setPayments(paymentsData);

      const uniqueDistricts = Array.from(
        new Set(paymentsData.map((p) => p.district).filter(Boolean))
      ).sort();
      setDistricts(uniqueDistricts);

    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (districtFilter !== "all") {
      filtered = filtered.filter((p) => p.district === districtFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.paymentStatus === statusFilter);
    }

    setFilteredPayments(filtered);
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

  const isExpiringSoon = (paidUntil: string | null) => {
    if (!paidUntil) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(paidUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (paidUntil: string | null) => {
    if (!paidUntil) return false;
    return new Date(paidUntil) < new Date();
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

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter((p) => p.paymentStatus === "paid").length;
  const unpaidCount = payments.filter((p) => p.paymentStatus === "unpaid").length;
  const expiringSoon = payments.filter((p) => isExpiringSoon(p.paidUntil)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">Payments & Renewals</h1>
        <p className="text-muted-foreground mt-2">
          Regional payment overview for {assignment.region}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {paidCount} paid schools
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Schools</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((paidCount / payments.length) * 100).toFixed(1)}% compliance
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Schools</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unpaidCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require follow-up
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>GNACOPS ID</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{payment.schoolName}</TableCell>
                      <TableCell>{payment.district}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {payment.gnacopsId}
                        </code>
                      </TableCell>
                      <TableCell>
                        {payment.lastPayment
                          ? new Date(payment.lastPayment).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {payment.paidUntil ? (
                          <div className="flex items-center gap-2">
                            {new Date(payment.paidUntil).toLocaleDateString()}
                            {isExpired(payment.paidUntil) && (
                              <Badge variant="destructive" className="text-xs">Expired</Badge>
                            )}
                            {isExpiringSoon(payment.paidUntil) && (
                              <Badge variant="secondary" className="text-xs">Soon</Badge>
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{getPaymentBadge(payment.paymentStatus)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalPaymentsPage;
