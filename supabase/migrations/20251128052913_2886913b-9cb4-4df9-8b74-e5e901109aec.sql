-- Fix infinite recursion in staff_assignments RLS policies
-- Drop ALL existing policies on staff_assignments
DROP POLICY IF EXISTS "Admins can manage all staff assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Regional coordinators can view assignments in their region" ON staff_assignments;
DROP POLICY IF EXISTS "District coordinators can view assignments in their district" ON staff_assignments;
DROP POLICY IF EXISTS "Coordinators can manage own assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Coordinators can view coordinator assignments" ON staff_assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON staff_assignments;

-- Create non-recursive policies using user_roles table
CREATE POLICY "Admin full access to staff assignments"
ON staff_assignments
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Coordinators view coordinator assignments"
ON staff_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('regional_coordinator'::app_role, 'district_coordinator'::app_role)
  )
);

CREATE POLICY "Users view own staff assignments"
ON staff_assignments
FOR SELECT
USING (user_id = auth.uid());