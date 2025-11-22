import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useMarketplaceCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['marketplace-cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('marketplace_cart')
        .select('*, marketplace_products(*, marketplace_product_images(*))')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data, error } = await supabase
        .from('marketplace_cart')
        .insert({
          user_id: user!.id,
          product_id: productId,
          quantity,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
      toast.success('Added to cart!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('marketplace_cart')
        .update({ quantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketplace_cart')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
      toast.success('Removed from cart');
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('marketplace_cart')
        .delete()
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-cart'] });
    },
  });

  const cartTotal = cartItems?.reduce((sum, item) => {
    return sum + (item.marketplace_products?.price || 0) * item.quantity;
  }, 0) || 0;

  return {
    cartItems,
    isLoading,
    cartTotal,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
  };
}
