import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  region: string | null;
  district: string | null;
}

export function useDistrictCoordinatorAuth() {
  const { user } = useAuth();
  const [isDistrictCoordinator, setIsDistrictCoordinator] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user) {
      checkDistrictCoordinatorRole();
    }
  }, [user, navigate]);

  const checkDistrictCoordinatorRole = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Check role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['district_coordinator', 'admin', 'super_admin']);

      if (roleError) throw roleError;

      const hasDistrictCoordinatorAccess = roleData && roleData.length > 0;
      setIsDistrictCoordinator(hasDistrictCoordinatorAccess);

      if (!hasDistrictCoordinatorAccess) {
        navigate('/');
        return;
      }

      // Fetch assignment data
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('staff_assignments')
        .select('region, district')
        .eq('user_id', user.id)
        .eq('role', 'district_coordinator')
        .maybeSingle();

      if (assignmentError) throw assignmentError;

      if (!assignmentData) {
        setError('No district assignment found. Please contact an administrator.');
      }

      setAssignment(assignmentData);
    } catch (error) {
      console.error('Error checking district coordinator role:', error);
      setError('Failed to load coordinator data. Please try again.');
      setIsDistrictCoordinator(false);
    } finally {
      setCheckingRole(false);
    }
  };

  return {
    user,
    isDistrictCoordinator,
    assignment,
    error,
    loading: checkingRole,
  };
}
