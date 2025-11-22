import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function useSecretaryAuth() {
  const { user } = useAuth();
  const [isSecretary, setIsSecretary] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user) {
      checkSecretaryRole();
    }
  }, [user, navigate]);

  const checkSecretaryRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['secretary', 'admin', 'super_admin']);

      if (error) throw error;

      const hasSecretaryAccess = data && data.length > 0;
      setIsSecretary(hasSecretaryAccess);

      if (!hasSecretaryAccess) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking secretary role:', error);
      setIsSecretary(false);
    } finally {
      setCheckingRole(false);
    }
  };

  return {
    user,
    isSecretary,
    loading: checkingRole,
  };
}
