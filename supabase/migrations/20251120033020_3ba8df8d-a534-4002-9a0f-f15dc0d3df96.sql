-- Fix infinite recursion in staff_assignments RLS policies
-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Admins can manage staff assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "Regional coordinators can view regional assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "District coordinators can view district assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "Users can view own assignment" ON public.staff_assignments;

-- Create simpler, non-recursive policies
CREATE POLICY "Admins can manage all staff assignments"
ON public.staff_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Users can view own staff assignment"
ON public.staff_assignments
FOR SELECT
USING (user_id = auth.uid());