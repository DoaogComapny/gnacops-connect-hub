import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const SecretaryPayments = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["secretary-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select(`
          *,
          profiles!inner(full_name, email),
          form_categories(name, price)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: payments?.reduce((sum, p: any) => sum + (p.amount || 0), 0) || 0,
    paid: payments?.filter((p: any) => p.payment_status === "paid").length || 0,
    pending: payments?.filter((p: any) => p.payment_status === "pending").length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent mb-2">Payments</h1>
        <p className="text-muted-foreground">Track membership payments and revenue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS ₵{stats.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Transactions
          </CardTitle>
          <CardDescription>Recent membership payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {payments?.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{payment.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{payment.profiles?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {payment.gnacops_id}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {payment.form_categories?.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">GHS ₵{payment.amount?.toFixed(2) || "0.00"}</p>
                    <Badge
                      variant={payment.payment_status === "paid" ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {payment.payment_status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(payment.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretaryPayments;
