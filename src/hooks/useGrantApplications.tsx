import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GrantApplication {
  id: string;
  title: string;
  applicant_school_id?: string;
  amount: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'disbursed';
  application_data: any;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

export function useGrantApplications() {
  const queryClient = useQueryClient();

  const { data: grants, isLoading } = useQuery({
    queryKey: ['grant_applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grant_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GrantApplication[];
    },
  });

  const createGrant = useMutation({
    mutationFn: async (grant: Pick<GrantApplication, 'title' | 'amount'> & Partial<Omit<GrantApplication, 'title' | 'amount'>>) => {
      const { data, error } = await supabase
        .from('grant_applications')
        .insert([grant])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant_applications'] });
      toast.success('Grant application created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create grant application: ' + error.message);
    },
  });

  const updateGrant = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GrantApplication> & { id: string }) => {
      const { data, error } = await supabase
        .from('grant_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant_applications'] });
      toast.success('Grant application updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update grant application: ' + error.message);
    },
  });

  return {
    grants,
    isLoading,
    createGrant: createGrant.mutate,
    updateGrant: updateGrant.mutate,
  };
}
