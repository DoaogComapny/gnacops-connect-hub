import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Policy {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'implemented';
  department_id?: string;
  created_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  implementation_progress: number;
}

export function usePolicies() {
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Policy[];
    },
  });

  const createPolicy = useMutation({
    mutationFn: async (policy: Pick<Policy, 'title' | 'content'> & Partial<Omit<Policy, 'title' | 'content'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('policies')
        .insert([{ ...policy, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create policy: ' + error.message);
    },
  });

  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Policy> & { id: string }) => {
      const { data, error } = await supabase
        .from('policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update policy: ' + error.message);
    },
  });

  return {
    policies,
    isLoading,
    createPolicy: createPolicy.mutate,
    updatePolicy: updatePolicy.mutate,
  };
}
