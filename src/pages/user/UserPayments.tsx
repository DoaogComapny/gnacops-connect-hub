import { CreditCard, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserPayments = () => {
  const paymentHistory = [
    { id: 1, date: "2025-01-10", description: "Membership Fee", amount: "GHS 500", status: "Completed" },
    { id: 2, date: "2024-12-15", description: "Annual Renewal", amount: "GHS 500", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage your payments and billing</p>
      </div>

      {/* Payment Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-3xl font-bold text-primary">GHS 0</p>
              <Badge variant="default" className="mt-2">Paid</Badge>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next Payment Due</p>
              <p className="text-xl font-semibold">January 2026</p>
              <p className="text-sm text-muted-foreground mt-2">Annual Renewal</p>
            </div>
            <CreditCard className="h-10 w-10 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Make Payment */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>
        <p className="text-muted-foreground mb-4">
          Your membership is currently active. The next payment will be due for your annual renewal.
        </p>
        <Button variant="cta" disabled>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Now (Coming Soon)
        </Button>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentHistory.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="font-medium">{payment.description}</TableCell>
                <TableCell className="font-semibold">{payment.amount}</TableCell>
                <TableCell>
                  <Badge variant="default">{payment.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UserPayments;
