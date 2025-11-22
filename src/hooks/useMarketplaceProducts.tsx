import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMarketplaceProducts(vendorId?: string) {
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['marketplace-products', vendorId],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_products')
        .select('*, marketplace_vendors(business_name), marketplace_product_images(*)');

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      } else {
        query = query.eq('is_active', true).eq('admin_approved', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      const { data, error } = await supabase
        .from('marketplace_products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('marketplace_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  return {
    products,
    isLoading,
    createProduct: createProduct.mutate,
    updateProduct: updateProduct.mutate,
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
  };
}
