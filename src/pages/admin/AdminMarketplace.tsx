import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export default function AdminMarketplace() {
  const queryClient = useQueryClient();

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('*, marketplace_vendors(business_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('marketplace_vendors')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success('Vendor approved successfully');
    },
  });

  const rejectVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('marketplace_vendors')
        .update({ status: 'rejected' })
        .eq('id', vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success('Vendor rejected');
    },
  });

  const approveProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('marketplace_products')
        .update({ admin_approved: true, admin_approved_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product approved successfully');
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Marketplace Management</h1>

      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div>Loading vendors...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors?.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.business_name}</TableCell>
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>{vendor.business_category}</TableCell>
                        <TableCell>
                          <Badge variant={vendor.status === 'approved' ? 'default' : 'secondary'}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vendor.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveVendor.mutate(vendor.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectVendor.mutate(vendor.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div>Loading products...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.marketplace_vendors?.business_name}</TableCell>
                        <TableCell>GH₵ {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.admin_approved ? 'default' : 'secondary'}>
                            {product.admin_approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!product.admin_approved && product.requires_admin_approval && (
                            <Button
                              size="sm"
                              onClick={() => approveProduct.mutate(product.id)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Order management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
