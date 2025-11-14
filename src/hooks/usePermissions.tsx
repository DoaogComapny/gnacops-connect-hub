import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Permission {
  permission_code: string;
  permission_name: string;
  module: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    fetchPermissions();
  }, [user]);

  const fetchPermissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_permissions', { _user_id: user.id });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    return permissions.some(p => p.permission_code === permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code));
  };

  const getModulePermissions = (module: 'membership' | 'office_management' | 'both'): Permission[] => {
    return permissions.filter(p => p.module === module || p.module === 'both');
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getModulePermissions,
  };
}
