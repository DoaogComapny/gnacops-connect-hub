import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface SchoolRegistration {
  id: string;
  school_name: string;
  registration_number?: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  school_address: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected' | 'suspended';
  license_expiry?: string;
  registration_data: any;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export function useSchoolRegistrations() {
  const queryClient = useQueryClient();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['school_registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SchoolRegistration[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_registrations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['school_registrations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createRegistration = useMutation({
    mutationFn: async (registration: Pick<SchoolRegistration, 'school_name' | 'owner_name' | 'owner_email' | 'owner_phone' | 'school_address'> & Partial<Omit<SchoolRegistration, 'school_name' | 'owner_name' | 'owner_email' | 'owner_phone' | 'school_address'>>) => {
      const { data, error } = await supabase
        .from('school_registrations')
        .insert([registration])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_registrations'] });
      toast.success('School registration created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create registration: ' + error.message);
    },
  });

  const updateRegistration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SchoolRegistration> & { id: string }) => {
      const { data, error } = await supabase
        .from('school_registrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_registrations'] });
      toast.success('Registration updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update registration: ' + error.message);
    },
  });

  return {
    registrations,
    isLoading,
    createRegistration: createRegistration.mutate,
    updateRegistration: updateRegistration.mutate,
  };
}
