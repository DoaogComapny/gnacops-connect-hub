import { useState, useEffect } from "react";
import { CreditCard, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const UserPayments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadData();
    
    // Check for payment completion from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    
    if (paymentId) {
      // Verify payment status
      verifyPayment(paymentId);
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const verifyPayment = async (paymentId: string) => {
    try {
      const { data: payment } = await supabase
        .from("payments")
        .select("status")
        .eq("id", paymentId)
        .single();
      
      if (payment?.status === "completed") {
        toast({
          title: "Payment Successful",
          description: "Your membership payment has been confirmed!",
        });
      } else {
        toast({
          title: "Payment Pending",
          description: "Your payment is being verified. This may take a few moments.",
        });
      }
      
      loadData();
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    
    setUser(user);
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setPaymentDetails({
        email: profile.email || user.email || "",
        phone: profile.phone || "",
      });
    }

    const { data: membershipData } = await supabase
      .from("memberships")
      .select("*, form_categories(name, price)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (membershipData) {
      setMembership(membershipData);
    }

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (paymentsData) {
      setPaymentHistory(paymentsData);
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails.email || !paymentDetails.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and phone number",
        variant: "destructive",
      });
      return;
    }

    if (!membership) {
      toast({
        title: "Error",
        description: "No membership found",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Fetch fresh price from database at payment time
      const { data: freshCategory, error: categoryError } = await supabase
        .from("form_categories")
        .select("price")
        .eq("id", membership.category_id)
        .single();

      if (categoryError) throw categoryError;

      const currentPrice = freshCategory.price;

      // Create payment record with current price
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          membership_id: membership.id,
          amount: currentPrice,
          currency: "GHS",
          status: "pending",
          payment_method: "paystack",
          plan_id: membership.category_id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Initialize Paystack payment
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          paymentId: payment.id,
          email: paymentDetails.email,
        },
      });

      if (error) throw error;

      if (!data?.authorization_url) {
        throw new Error("Failed to initialize payment");
      }

      toast({
        title: "Redirecting to Payment",
        description: "Opening Paystack secure payment gateway...",
      });

      // Redirect to Paystack
      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage your payments and billing</p>
      </div>

      {/* Payment Status */}
      {membership && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance Due</p>
                <p className="text-3xl font-bold text-red-600">
                  GHS ₵{membership.payment_status === 'paid' ? '0' : (membership.form_categories?.price || 0)}
                </p>
                <Badge variant="secondary" className={membership.payment_status === 'paid' ? 'mt-2 bg-green-100 text-green-700' : 'mt-2 bg-red-100 text-red-700'}>
                  {membership.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              <AlertCircle className={membership.payment_status === 'paid' ? 'h-10 w-10 text-green-500' : 'h-10 w-10 text-red-500'} />
            </div>
          </Card>

          <Card className="p-6 hover-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membership Type</p>
                <p className="text-xl font-semibold">{membership.form_categories?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground mt-2">Annual Fee</p>
              </div>
              <CreditCard className="h-10 w-10 text-accent/50" />
            </div>
          </Card>
        </div>
      )}

      {/* Make Payment */}
      {membership && membership.payment_status !== 'paid' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Your Payment</h2>
          <div className="space-y-4">
            <div className="bg-accent/5 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Membership Fee:</span>
                <span className="font-semibold">GHS ₵{membership.form_categories?.price || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total Amount Due:</span>
                <span className="text-2xl font-bold text-accent">GHS ₵{membership.form_categories?.price || 0}</span>
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
                  <p className="text-2xl font-bold text-primary">GHS ₵{membership?.form_categories?.price || 0}</p>
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
                      Pay with Paystack
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You will be redirected to Paystack secure payment gateway
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-sm text-muted-foreground text-center">
            Secure payment powered by Paystack
          </p>
        </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        {paymentHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">GHS ₵{payment.amount}</TableCell>
                  <TableCell className="capitalize">{payment.payment_method}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No payment history yet</p>
        )}
      </Card>
    </div>
  );
};

export default UserPayments;
