import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  region: string | null;
}

export function useRegionalCoordinatorAuth() {
  const { user } = useAuth();
  const [isRegionalCoordinator, setIsRegionalCoordinator] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (!user) {
        setCheckingRole(false);
        navigate('/login');
        return;
      }
      await checkRegionalCoordinatorRole();
    };
    
    initAuth();
  }, [user]);

  const checkRegionalCoordinatorRole = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Check role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['regional_coordinator', 'admin', 'super_admin']);

      if (roleError) throw roleError;

      const hasRegionalCoordinatorAccess = roleData && roleData.length > 0;
      setIsRegionalCoordinator(hasRegionalCoordinatorAccess);

      if (!hasRegionalCoordinatorAccess) {
        navigate('/');
        return;
      }

      // Fetch assignment data
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('staff_assignments')
        .select('region')
        .eq('user_id', user.id)
        .eq('role', 'regional_coordinator')
        .maybeSingle();

      if (assignmentError) throw assignmentError;

      if (!assignmentData) {
        setError('No regional assignment found. Please contact an administrator.');
      }

      setAssignment(assignmentData);
    } catch (error) {
      console.error('Error checking regional coordinator role:', error);
      setError('Failed to load coordinator data. Please try again.');
      setIsRegionalCoordinator(false);
    } finally {
      setCheckingRole(false);
    }
  };

  return {
    user,
    isRegionalCoordinator,
    assignment,
    error,
    loading: checkingRole,
  };
}