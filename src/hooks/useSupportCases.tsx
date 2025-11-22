import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface SupportCase {
  id: string;
  school_id?: string;
  case_type: 'welfare' | 'dispute' | 'complaint' | 'assistance' | 'advocacy';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export function useSupportCases() {
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['support_cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportCase[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('support-cases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_cases'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['support_cases'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createCase = useMutation({
    mutationFn: async (supportCase: Pick<SupportCase, 'title' | 'description' | 'case_type'> & Partial<Omit<SupportCase, 'title' | 'description' | 'case_type'>>) => {
      const { data, error } = await supabase
        .from('support_cases')
        .insert([supportCase])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_cases'] });
      toast.success('Support case created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create support case: ' + error.message);
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SupportCase> & { id: string }) => {
      const { data, error } = await supabase
        .from('support_cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_cases'] });
      toast.success('Support case updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update support case: ' + error.message);
    },
  });

  return {
    cases,
    isLoading,
    createCase: createCase.mutate,
    updateCase: updateCase.mutate,
  };
}
