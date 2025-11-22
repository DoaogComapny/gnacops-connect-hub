import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MarketplaceOrders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['marketplace-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*, marketplace_vendors(business_name), marketplace_order_items(*, marketplace_products(title))')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
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
                        Placed on {format(new Date(order.created_at!), 'PPP')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vendor: {order.marketplace_vendors?.business_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.order_status === 'delivered' ? 'default' : 'secondary'}>
                        {order.order_status}
                      </Badge>
                      <p className="text-lg font-bold mt-2">GH₵ {order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Items:</h4>
                    {order.marketplace_order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.marketplace_products?.title} x {item.quantity}</span>
                        <span>GH₵ {item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm"><strong>Delivery Address:</strong> {order.delivery_address}</p>
                    <p className="text-sm"><strong>Phone:</strong> {order.delivery_phone}</p>
                    {order.notes && <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>}
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
