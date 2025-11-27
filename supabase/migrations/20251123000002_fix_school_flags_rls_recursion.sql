-- Fix infinite recursion in school_flags RLS policies
-- These policies query staff_assignments which can cause recursion

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

