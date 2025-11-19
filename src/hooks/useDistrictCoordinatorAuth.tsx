import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function useDistrictCoordinatorAuth() {
  const { user, loading } = useAuth();
  const [isDistrictCoordinator, setIsDistrictCoordinator] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      checkDistrictCoordinatorRole();
    }
  }, [user, loading, navigate]);

  const checkDistrictCoordinatorRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['district_coordinator', 'admin', 'super_admin']);

      if (error) throw error;

      const hasDistrictCoordinatorAccess = data && data.length > 0;
      setIsDistrictCoordinator(hasDistrictCoordinatorAccess);

      if (!hasDistrictCoordinatorAccess) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking district coordinator role:', error);
      setIsDistrictCoordinator(false);
    } finally {
      setCheckingRole(false);
    }
  };

  return {
    user,
    isDistrictCoordinator,
    loading: loading || checkingRole,
  };
}
