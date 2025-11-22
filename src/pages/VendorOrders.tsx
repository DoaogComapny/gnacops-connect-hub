import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVendor } from '@/hooks/useVendor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const orderStatuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

export default function VendorOrders() {
  const { vendor } = useVendor();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*, marketplace_order_items(*, marketplace_products(title))')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updates: any = { order_status: status };
      if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
      if (status === 'dispatched') updates.dispatched_at = new Date().toISOString();
      if (status === 'delivered') updates.delivered_at = new Date().toISOString();
      if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

      const { error } = await supabase
        .from('marketplace_orders')
        .update(updates)
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      toast.success('Order status updated');
    },
  });

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p>You need to be a vendor to access this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading orders...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Vendor Orders</h1>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No orders received yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Ordered on {format(new Date(order.created_at!), 'PPP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">GH₵ {order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Items:</h4>
                    {order.marketplace_order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.marketplace_products?.title} x {item.quantity}</span>
                        <span>GH₵ {item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm"><strong>Delivery Address:</strong> {order.delivery_address}</p>
                    <p className="text-sm"><strong>Phone:</strong> {order.delivery_phone}</p>
                    {order.notes && <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <span className="text-sm font-medium">Update Status:</span>
                    <Select
                      value={order.order_status}
                      onValueChange={(value) => updateOrderStatus.mutate({ orderId: order.id, status: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                      Payment: {order.payment_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
