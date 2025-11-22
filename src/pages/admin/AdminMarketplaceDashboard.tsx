import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

export default function AdminMarketplaceDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: async () => {
      const [vendorsRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('marketplace_vendors').select('id, status'),
        supabase.from('marketplace_products').select('id, price'),
        supabase.from('marketplace_orders').select('id, total_amount, order_status'),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      const activeVendors = vendorsRes.data?.filter(v => v.status === 'approved').length || 0;
      const pendingVendors = vendorsRes.data?.filter(v => v.status === 'pending').length || 0;
      const activeProducts = productsRes.data?.length || 0;
      const totalOrders = ordersRes.data?.length || 0;
      const pendingOrders = ordersRes.data?.filter(o => o.order_status === 'pending').length || 0;

      return {
        totalRevenue,
        activeVendors,
        pendingVendors,
        activeProducts,
        totalOrders,
        pendingOrders,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Revenue',
      value: `GH₵ ${stats?.totalRevenue.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      description: 'Total marketplace revenue',
    },
    {
      title: 'Active Vendors',
      value: stats?.activeVendors || 0,
      icon: Users,
      description: `${stats?.pendingVendors || 0} pending approval`,
    },
    {
      title: 'Active Products',
      value: stats?.activeProducts || 0,
      icon: Package,
      description: 'Listed products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: `${stats?.pendingOrders || 0} pending`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Marketplace Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent marketplace activities will appear here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Manage vendors, products, orders, and more from the sidebar menu
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
