import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useModuleAccess() {
  const { user } = useAuth();
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setModules([]);
      setLoading(false);
      return;
    }

    fetchModuleAccess();
  }, [user]);

  const fetchModuleAccess = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_module_access')
        .select('module')
        .eq('user_id', user.id);

      if (error) throw error;
      setModules(data?.map(m => m.module) || []);
    } catch (error) {
      console.error('Error fetching module access:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const hasModuleAccess = (module: 'membership' | 'office_management'): boolean => {
    return modules.includes(module);
  };

  const hasAnyModuleAccess = (): boolean => {
    return modules.length > 0;
  };

  return {
    modules,
    loading,
    hasModuleAccess,
    hasAnyModuleAccess,
    refetch: fetchModuleAccess,
  };
}
