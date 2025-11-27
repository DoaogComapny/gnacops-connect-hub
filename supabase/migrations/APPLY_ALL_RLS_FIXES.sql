-- ============================================================================
-- COMPLETE RLS RECURSION FIX - ALL MIGRATIONS IN ONE FILE
-- ============================================================================
-- This file combines all three RLS recursion fixes into one easy-to-apply migration
-- Apply this entire file in your Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Fix staff_assignments RLS recursion
-- ============================================================================

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

-- ============================================================================
-- MIGRATION 2: Fix form_submissions RLS recursion
-- ============================================================================

-- Drop existing recursive policies
DROP POLICY IF EXISTS "District coordinators can view assigned district submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Regional coordinators can view regional submissions" ON public.form_submissions;

-- Create helper functions that bypass RLS to get coordinator assignments
CREATE OR REPLACE FUNCTION public.get_coordinator_region(_user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coord_region TEXT;
BEGIN
  -- Bypass RLS using SECURITY DEFINER
  SELECT region INTO coord_region
  FROM public.staff_assignments
  WHERE user_id = _user_id
    AND role IN ('regional_coordinator', 'district_coordinator')
  LIMIT 1;
  
  RETURN coord_region;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_coordinator_district(_user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coord_district TEXT;
BEGIN
  -- Bypass RLS using SECURITY DEFINER
  SELECT district INTO coord_district
  FROM public.staff_assignments
  WHERE user_id = _user_id
    AND role = 'district_coordinator'
  LIMIT 1;
  
  RETURN coord_district;
END;
$$;

-- Create non-recursive policies for form_submissions

-- Policy: District coordinators can view submissions in their district
CREATE POLICY "District coordinators can view assigned district submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  -- Check if user is a district coordinator via user_roles (no recursion)
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'district_coordinator'
  )
  -- And the submission is in their assigned district
  AND (form_submissions.submission_data->>'region') = public.get_coordinator_region(auth.uid())
  AND (form_submissions.submission_data->>'district') = public.get_coordinator_district(auth.uid())
);

-- Policy: Regional coordinators can view all submissions in their region
CREATE POLICY "Regional coordinators can view regional submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  -- Check if user is a regional coordinator via user_roles (no recursion)
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'regional_coordinator'
  )
  -- And the submission is in their assigned region
  AND (form_submissions.submission_data->>'region') = public.get_coordinator_region(auth.uid())
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_coordinator_region(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coordinator_district(uuid) TO authenticated;

-- ============================================================================
-- MIGRATION 3: Fix school_flags RLS recursion
-- ============================================================================

-- Drop existing recursive policies
DROP POLICY IF EXISTS "District coordinators can manage flags in their district" ON public.school_flags;
DROP POLICY IF EXISTS "Regional coordinators can manage flags in their region" ON public.school_flags;

-- Create non-recursive policies using the helper functions we created earlier

-- Policy: District coordinators can manage flags in their district
CREATE POLICY "District coordinators can manage flags in their district"
ON public.school_flags
FOR ALL
TO authenticated
USING (
  -- Check if user is a district coordinator via user_roles (no recursion)
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'district_coordinator'
  )
  -- And the school is in their assigned district
  AND EXISTS (
    SELECT 1 FROM public.form_submissions fs
    WHERE fs.id = school_flags.school_id
      AND (fs.submission_data->>'region') = public.get_coordinator_region(auth.uid())
      AND (fs.submission_data->>'district') = public.get_coordinator_district(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'district_coordinator'
  )
  AND EXISTS (
    SELECT 1 FROM public.form_submissions fs
    WHERE fs.id = school_flags.school_id
      AND (fs.submission_data->>'region') = public.get_coordinator_region(auth.uid())
      AND (fs.submission_data->>'district') = public.get_coordinator_district(auth.uid())
  )
);

-- Policy: Regional coordinators can manage flags in their region
CREATE POLICY "Regional coordinators can manage flags in their region"
ON public.school_flags
FOR ALL
TO authenticated
USING (
  -- Check if user is a regional coordinator via user_roles (no recursion)
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'regional_coordinator'
  )
  -- And the school is in their assigned region
  AND EXISTS (
    SELECT 1 FROM public.form_submissions fs
    WHERE fs.id = school_flags.school_id
      AND (fs.submission_data->>'region') = public.get_coordinator_region(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'regional_coordinator'
  )
  AND EXISTS (
    SELECT 1 FROM public.form_submissions fs
    WHERE fs.id = school_flags.school_id
      AND (fs.submission_data->>'region') = public.get_coordinator_region(auth.uid())
  )
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All RLS recursion issues have been fixed!
-- 
-- What was fixed:
-- ✅ staff_assignments table - No more recursion
-- ✅ form_submissions table - No more recursion  
-- ✅ school_flags table - No more recursion
--
-- Test your application:
-- 1. Coordinator pages should now load without errors
-- 2. Applications page should now load without errors
-- 3. No more "infinite recursion" errors in browser console
-- ============================================================================

