import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface SchoolInspection {
  id: string;
  school_id: string;
  inspection_date: string;
  inspector_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  compliance_score?: number;
  report_url?: string;
  findings?: string;
  recommendations?: string;
  created_at: string;
  updated_at: string;
}

export function useSchoolInspections() {
  const queryClient = useQueryClient();

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['school_inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_inspections')
        .select('*')
        .order('inspection_date', { ascending: false });

      if (error) throw error;
      return data as SchoolInspection[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('inspections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_inspections'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['school_inspections'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createInspection = useMutation({
    mutationFn: async (inspection: Pick<SchoolInspection, 'school_id' | 'inspection_date'> & Partial<Omit<SchoolInspection, 'school_id' | 'inspection_date'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('school_inspections')
        .insert([{ ...inspection, inspector_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_inspections'] });
      toast.success('Inspection scheduled successfully');
    },
    onError: (error) => {
      toast.error('Failed to schedule inspection: ' + error.message);
    },
  });

  const updateInspection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SchoolInspection> & { id: string }) => {
      const { data, error } = await supabase
        .from('school_inspections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_inspections'] });
      toast.success('Inspection updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update inspection: ' + error.message);
    },
  });

  return {
    inspections,
    isLoading,
    createInspection: createInspection.mutate,
    updateInspection: updateInspection.mutate,
  };
}
