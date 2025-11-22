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
        .from('department_staff_assignments')
        .select('department_code, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsDepartmentStaff(true);
        setDepartmentData({
          department: data.department_code,
          role: data.role,
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
