import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useVendor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const applyAsVendor = useMutation({
    mutationFn: async (applicationData: any) => {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .insert({
          user_id: user!.id,
          business_name: applicationData.businessName,
          business_category: applicationData.businessCategory,
          email: applicationData.email,
          phone: applicationData.phone,
          business_address: applicationData.businessAddress,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast.success('Vendor application submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  return {
    vendor,
    isLoading,
    applyAsVendor: applyAsVendor.mutate,
    isApplying: applyAsVendor.isPending,
  };
}
