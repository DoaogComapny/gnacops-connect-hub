-- Fix infinite recursion in staff_assignments RLS policies
-- This migration drops all recursive policies and creates non-recursive alternatives

-- Drop ALL existing policies on staff_assignments to start fresh
DROP POLICY IF EXISTS "Admins can manage staff assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "Admins can manage all staff assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "Users can view own staff assignment" ON public.staff_assignments;
DROP POLICY IF EXISTS "Regional coordinators can view assignments in their region" ON public.staff_assignments;
DROP POLICY IF EXISTS "District coordinators can view assignments in their district" ON public.staff_assignments;
DROP POLICY IF EXISTS "Regional coordinators can view regional assignments" ON public.staff_assignments;
DROP POLICY IF EXISTS "District coordinators can view district assignments" ON public.staff_assignments;

-- Create non-recursive policies
-- All policies check user_roles instead of staff_assignments to avoid recursion

-- Policy 1: Admins can do everything
CREATE POLICY "Admins can manage all staff assignments"
ON public.staff_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Policy 2: Users can view their own assignment
CREATE POLICY "Users can view own staff assignment"
ON public.staff_assignments
FOR SELECT
USING (user_id = auth.uid());

-- Policy 3: Allow authenticated users with coordinator roles to view coordinator assignments
-- This is safe because it only checks user_roles (no recursion)
-- Coordinators need to see other coordinators in their region/district
CREATE POLICY "Coordinators can view coordinator assignments"
ON public.staff_assignments
FOR SELECT
USING (
  -- User must have a coordinator role (checked via user_roles, not staff_assignments)
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('regional_coordinator', 'district_coordinator', 'admin', 'super_admin')
  )
  -- And can only view coordinator assignments (not other staff types)
  AND role IN ('regional_coordinator', 'district_coordinator')
);


