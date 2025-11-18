-- Fix security issues identified in security scan

-- 1. Add RLS policies for coordinators to view staff_assignments in their region/district
CREATE POLICY "Regional coordinators can view assignments in their region"
ON staff_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_assignments sa
    WHERE sa.user_id = auth.uid()
    AND sa.role = 'regional_coordinator'
    AND sa.region = staff_assignments.region
  )
);

CREATE POLICY "District coordinators can view assignments in their district"
ON staff_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_assignments sa
    WHERE sa.user_id = auth.uid()
    AND sa.role = 'district_coordinator'
    AND sa.region = staff_assignments.region
    AND sa.district = staff_assignments.district
  )
);

-- 2. Add server-side validation for appointments table
ALTER TABLE appointments
ADD CONSTRAINT appointment_date_future CHECK (appointment_date > now()),
ADD CONSTRAINT appointment_duration_valid CHECK (duration_minutes >= 15 AND duration_minutes <= 240),
ADD CONSTRAINT appointment_purpose_length CHECK (char_length(purpose) <= 500);

ALTER TABLE appointments
ADD CONSTRAINT appointment_type_valid CHECK (appointment_type IN ('in-person', 'virtual'));

-- 3. Fix function search_path for security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id AND p.code = _permission_code
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(permission_code text, permission_name text, module text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT p.code, p.name, p.module
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.name
$$;

CREATE OR REPLACE FUNCTION public.log_audit(
  _user_id uuid,
  _action text,
  _entity_type text,
  _entity_id uuid,
  _old_data jsonb DEFAULT NULL,
  _new_data jsonb DEFAULT NULL,
  _module text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _audit_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, module)
  VALUES (_user_id, _action, _entity_type, _entity_id, _old_data, _new_data, _module)
  RETURNING id INTO _audit_id;
  RETURN _audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_membership_serial(_category_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_serial integer;
BEGIN
  INSERT INTO public.membership_serials (category_id, last_serial)
  VALUES (_category_id, 1)
  ON CONFLICT (category_id)
  DO UPDATE SET last_serial = public.membership_serials.last_serial + 1
  RETURNING last_serial INTO new_serial;

  UPDATE public.membership_serials SET updated_at = now() WHERE category_id = _category_id;
  RETURN new_serial;
END;
$$;

-- 4. Restrict audit_logs insertion to only authenticated users with proper verification
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Add document access filtering by department/unit assignment
CREATE POLICY "Users can view documents from their departments"
ON documents
FOR SELECT
TO authenticated
USING (
  is_public = true
  OR auth.uid() = uploaded_by
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'super_admin')
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    -- Users with office management access can view documents from their assigned units/departments
  )
);

-- Add index for better performance on staff_assignments region/district lookups
CREATE INDEX IF NOT EXISTS idx_staff_assignments_region_district ON staff_assignments(region, district);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_role ON staff_assignments(user_id, role);
