import { useState } from "react";
import { CreditCard, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserPayments = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // This would come from user context/state
  const membershipInfo = {
    type: "Institutional Membership",
    price: 500,
    status: "Unpaid",
  };

  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    phone: "",
  });

  const handlePayment = async () => {
    if (!paymentDetails.email || !paymentDetails.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    // In production, this would integrate with Paystack/Flutterwave/Stripe
    setTimeout(() => {
      toast({
        title: "Payment Initiated",
        description: "You will be redirected to the payment gateway...",
      });
      
      // This is where you'd redirect to actual payment gateway
      // For Paystack: https://paystack.com/pay/[payment_code]
      // For Flutterwave: https://checkout.flutterwave.com/[payment_link]
      
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentDialogOpen(false);
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. You'll receive a confirmation shortly.",
        });
      }, 2000);
    }, 1500);
  };

  const paymentHistory = [
    { id: 1, date: "2024-01-10", description: "Institutional Membership - Initial", amount: "GHS ₵500", status: "Pending" },
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
              <p className="text-sm text-muted-foreground">Current Balance Due</p>
              <p className="text-3xl font-bold text-red-600">GHS ₵{membershipInfo.price}</p>
              <Badge variant="secondary" className="mt-2 bg-red-100 text-red-700">Unpaid</Badge>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Membership Type</p>
              <p className="text-xl font-semibold">{membershipInfo.type}</p>
              <p className="text-sm text-muted-foreground mt-2">Annual Fee</p>
            </div>
            <CreditCard className="h-10 w-10 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Make Payment */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Complete Your Payment</h2>
        <div className="space-y-4">
          <div className="bg-accent/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Membership Fee:</span>
              <span className="font-semibold">GHS ₵{membershipInfo.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Total Amount Due:</span>
              <span className="text-2xl font-bold text-accent">GHS ₵{membershipInfo.price}</span>
            </div>
          </div>
          
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="cta" size="lg" className="w-full">
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Enter your contact information to proceed with payment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={paymentDetails.email}
                    onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={paymentDetails.phone}
                    onChange={(e) => setPaymentDetails({...paymentDetails, phone: e.target.value})}
                  />
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Amount to Pay:</p>
                  <p className="text-2xl font-bold text-primary">GHS ₵{membershipInfo.price}</p>
                </div>
                <Button 
                  variant="cta" 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Pay with Payment Gateway
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You will be redirected to our secure payment gateway
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-sm text-muted-foreground text-center">
            Secure payment powered by Paystack/Flutterwave
          </p>
        </div>
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
                  <Badge variant={payment.status === "Completed" ? "default" : "secondary"}>
                    {payment.status}
                  </Badge>
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
