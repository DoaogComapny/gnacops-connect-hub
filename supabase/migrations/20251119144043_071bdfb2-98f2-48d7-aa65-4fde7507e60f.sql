-- Add RLS policies for District Coordinator data access
-- This ensures district coordinators can only view data from their assigned district

-- Policy: District coordinators can only view form submissions from their assigned district
CREATE POLICY "District coordinators can view assigned district submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_assignments sa
    WHERE sa.user_id = auth.uid()
      AND sa.role = 'district_coordinator'::app_role
      AND sa.region = (form_submissions.submission_data->>'region')
      AND sa.district = (form_submissions.submission_data->>'district')
  )
);

-- Policy: Regional coordinators can view all submissions in their region
CREATE POLICY "Regional coordinators can view regional submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.staff_assignments sa
    WHERE sa.user_id = auth.uid()
      AND sa.role = 'regional_coordinator'::app_role
      AND sa.region = (form_submissions.submission_data->>'region')
  )
);

-- Add performance indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_region 
ON public.form_submissions ((submission_data->>'region'));

CREATE INDEX IF NOT EXISTS idx_form_submissions_district 
ON public.form_submissions ((submission_data->>'district'));

CREATE INDEX IF NOT EXISTS idx_form_submissions_region_district 
ON public.form_submissions ((submission_data->>'region'), (submission_data->>'district'));

-- Add index on staff_assignments for faster coordinator lookups
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_role 
ON public.staff_assignments (user_id, role);

CREATE INDEX IF NOT EXISTS idx_staff_assignments_region_district 
ON public.staff_assignments (region, district);