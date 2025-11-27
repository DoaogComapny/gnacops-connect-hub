-- Fix infinite recursion in form_submissions RLS policies
-- These policies query staff_assignments which can cause recursion

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

