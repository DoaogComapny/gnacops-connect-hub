import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, Eye, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminMarketplaceProducts() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: products, isLoading } = useQuery({
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

  const approveProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('marketplace_products')
        .update({ 
          admin_approved: true, 
          admin_approved_at: new Date().toISOString(),
          admin_approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product approved successfully');
      setShowDetailsDialog(false);
    },
  });

  const featureProduct = useMutation({
    mutationFn: async ({ productId, featured }: { productId: string; featured: boolean }) => {
      const { error } = await supabase
        .from('marketplace_products')
        .update({ is_featured: featured })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('marketplace_products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
      setShowDetailsDialog(false);
    },
  });

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setShowDetailsDialog(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-muted-foreground">Manage all marketplace products</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.marketplace_vendors?.business_name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>GH₵ {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.admin_approved ? 'default' : 'secondary'}>
                      {product.admin_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.is_featured && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(product)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!product.admin_approved && product.requires_admin_approval && (
                        <Button
                          size="sm"
                          onClick={() => approveProduct.mutate(product.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={product.is_featured ? 'default' : 'outline'}
                        onClick={() => featureProduct.mutate({ productId: product.id, featured: !product.is_featured })}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct.mutate(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!products || products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products yet
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedProduct.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProduct.category}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Description</p>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Price</p>
                  <p className="text-sm">GH₵ {selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Stock</p>
                  <p className="text-sm">{selectedProduct.inventory_quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">SKU</p>
                  <p className="text-sm">{selectedProduct.sku || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Discount</p>
                  <p className="text-sm">{selectedProduct.discount_percentage}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
