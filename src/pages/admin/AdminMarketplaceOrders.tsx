import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

export default function AdminMarketplaceOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*, marketplace_vendors(business_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      dispatched: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    return (
      <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    );
  };

  const filterOrders = (status?: string) => {
    if (!status) return orders;
    return orders?.filter(order => order.order_status === status);
  };

  if (isLoading) {
    return <div className="p-6">Loading orders...</div>;
  }

  const OrderTable = ({ orders: filteredOrders }: { orders: any[] | undefined }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>{order.marketplace_vendors?.business_name}</TableCell>
            <TableCell>GH₵ {order.total_amount.toFixed(2)}</TableCell>
            <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
            <TableCell>{getStatusBadge(order.order_status)}</TableCell>
            <TableCell>
              {format(new Date(order.created_at), 'MMM dd, yyyy')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">Manage all marketplace orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <OrderTable orders={orders} />
            </TabsContent>

            <TabsContent value="pending">
              <OrderTable orders={filterOrders('pending')} />
            </TabsContent>

            <TabsContent value="confirmed">
              <OrderTable orders={filterOrders('confirmed')} />
            </TabsContent>

            <TabsContent value="dispatched">
              <OrderTable orders={filterOrders('dispatched')} />
            </TabsContent>

            <TabsContent value="delivered">
              <OrderTable orders={filterOrders('delivered')} />
            </TabsContent>

            <TabsContent value="cancelled">
              <OrderTable orders={filterOrders('cancelled')} />
            </TabsContent>
          </Tabs>

          {!orders || orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No orders yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
