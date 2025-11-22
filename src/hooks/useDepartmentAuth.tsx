import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DepartmentData {
  department: string | null;
  role: string | null;
}

export function useDepartmentAuth() {
  const { user, loading } = useAuth();
  const [isDepartmentStaff, setIsDepartmentStaff] = useState(false);
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      checkDepartmentRole();
    }
  }, [user, loading, navigate]);

  const checkDepartmentRole = async () => {
    if (!user) return;

    try {
      // Check if user has department assignment
      const { data, error } = await supabase
        .from('user_module_access')
        .select('module, metadata')
        .eq('user_id', user.id)
        .eq('module', 'office_management')
        .single();

      if (error) throw error;

      if (data && data.metadata?.department) {
        setIsDepartmentStaff(true);
        setDepartmentData({
          department: data.metadata.department,
          role: data.metadata.role || null,
        });
      } else {
        setIsDepartmentStaff(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking department role:', error);
      setIsDepartmentStaff(false);
    } finally {
      setCheckingRole(false);
    }
  };

  return {
    user,
    isDepartmentStaff,
    departmentData,
    loading: loading || checkingRole,
  };
}
