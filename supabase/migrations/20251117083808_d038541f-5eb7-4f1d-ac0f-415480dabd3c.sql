-- Second migration: Create staff_assignments table and add permissions
CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  region TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, region, district)
);

-- Enable RLS
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_assignments
CREATE POLICY "Admins can manage staff assignments"
  ON public.staff_assignments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own assignments"
  ON public.staff_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add permissions for coordinators
INSERT INTO public.permissions (code, name, description, module)
VALUES 
  ('coordinator.view_institutions', 'View Assigned Institutions', 'Can view institutions in assigned region/district', 'membership'),
  ('coordinator.view_payments', 'View Assigned Payments', 'Can view payments in assigned region/district', 'membership'),
  ('coordinator.view_appointments', 'View Assigned Appointments', 'Can view appointments in assigned region/district', 'both'),
  ('coordinator.generate_reports', 'Generate Regional Reports', 'Can generate reports for assigned region/district', 'both')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to regional_coordinator role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'regional_coordinator'::app_role, p.id
FROM public.permissions p
WHERE p.code IN (
  'coordinator.view_institutions',
  'coordinator.view_payments',
  'coordinator.view_appointments',
  'coordinator.generate_reports',
  'applications.view',
  'analytics.view'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to district_coordinator role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'district_coordinator'::app_role, p.id
FROM public.permissions p
WHERE p.code IN (
  'coordinator.view_institutions',
  'coordinator.view_payments',
  'coordinator.view_appointments',
  'coordinator.generate_reports',
  'applications.view'
)
ON CONFLICT DO NOTHING;

-- Create trigger for updating staff_assignments timestamp
CREATE TRIGGER update_staff_assignments_updated_at
  BEFORE UPDATE ON public.staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();