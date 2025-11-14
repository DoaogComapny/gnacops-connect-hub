-- Phase 1: Enhanced RBAC, Audit Logs, Notifications (Part 2 Fixed)

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions mapping table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Create user_module_access table
CREATE TABLE IF NOT EXISTS public.user_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create gnacops_units table
CREATE TABLE IF NOT EXISTS public.gnacops_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  responsibilities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnacops_units ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can view own module access" ON public.user_module_access;
CREATE POLICY "Users can view own module access" ON public.user_module_access FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all module access" ON public.user_module_access;
CREATE POLICY "Admins can view all module access" ON public.user_module_access FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage module access" ON public.user_module_access;
CREATE POLICY "Admins can manage module access" ON public.user_module_access FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view active units" ON public.gnacops_units;
CREATE POLICY "Anyone can view active units" ON public.gnacops_units FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage units" ON public.gnacops_units;
CREATE POLICY "Admins can manage units" ON public.gnacops_units FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_module_access_user_id ON public.user_module_access(user_id);

-- Create function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id AND p.code = _permission_code
  )
$$;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE (permission_code text, permission_name text, module text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.code, p.name, p.module
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.name
$$;

-- Create function to log audit
CREATE OR REPLACE FUNCTION public.log_audit(_user_id uuid, _action text, _entity_type text, _entity_id uuid, _old_data jsonb DEFAULT NULL, _new_data jsonb DEFAULT NULL, _module text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _audit_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, module)
  VALUES (_user_id, _action, _entity_type, _entity_id, _old_data, _new_data, _module)
  RETURNING id INTO _audit_id;
  RETURN _audit_id;
END;
$$;

-- Add trigger using existing update_updated_at function
DROP TRIGGER IF EXISTS update_gnacops_units_updated_at ON public.gnacops_units;
CREATE TRIGGER update_gnacops_units_updated_at
  BEFORE UPDATE ON public.gnacops_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert initial permissions
INSERT INTO public.permissions (code, name, description, module) VALUES
  ('generate_certificate', 'Generate Certificate', 'Can generate and issue certificates', 'membership'),
  ('reply_support', 'Reply to Support Tickets', 'Can view and respond to support tickets', 'both'),
  ('manage_users', 'Manage Users', 'Can view, edit, and deactivate users', 'both'),
  ('approve_applications', 'Approve Applications', 'Can approve/reject membership applications', 'membership'),
  ('view_payments', 'View Payments', 'Can view payment records/transactions', 'both'),
  ('view_analytics', 'View Analytics', 'Can access analytics and reports', 'both'),
  ('manage_staff', 'Manage Staff', 'Can add, edit, and remove staff members', 'both'),
  ('handle_recovery', 'Forgot ID and Passwords', 'Can handle recovery requests', 'both'),
  ('manage_departments', 'Manage Departments', 'Can manage department data and structure', 'office_management'),
  ('assign_tasks', 'Assign Tasks', 'Can assign and monitor tasks', 'office_management'),
  ('upload_documents', 'Upload Documents', 'Can upload and manage documents', 'office_management'),
  ('manage_meetings', 'Manage Meetings', 'Can schedule and manage meetings', 'office_management'),
  ('view_audit_logs', 'View Audit Logs', 'Can view system audit logs', 'both')
ON CONFLICT (code) DO NOTHING;

-- Insert GNACOPS Units
INSERT INTO public.gnacops_units (name, code, description, responsibilities) VALUES
  ('Coordination & Policy Development Unit', 'CPDU', 'Maintain national school database, develop/update school policies, engage MoE/GES', ARRAY['National school database', 'Policy development', 'MoE/GES engagement']),
  ('Educational Standards & Compliance Unit', 'ESCU', 'Internal training, teacher licensing, accreditation monitoring', ARRAY['Internal training', 'Teacher licensing', 'Accreditation monitoring']),
  ('Financial Sustainability & Development Support Unit', 'FSDSU', 'Funding models, loans, financial partnerships', ARRAY['Funding models', 'Loans management', 'Financial partnerships']),
  ('Curriculum Standardization & Educational Development Unit', 'CSEDU', 'Align curricula, ensure assessments, develop resources', ARRAY['Curriculum alignment', 'Assessment standards', 'Resource development']),
  ('Research, Innovation & Stakeholder Engagement Unit', 'RISEU', 'Research policy impact, engage stakeholders, promote EduTech', ARRAY['Policy research', 'Stakeholder engagement', 'EduTech promotion']),
  ('Support Services & Advocacy Unit', 'SSAU', 'Dispute resolution, health programs, legal support, counseling', ARRAY['Dispute resolution', 'Health programs', 'Legal support', 'Counseling services']),
  ('Private Education & Compliance Unit', 'PECU', 'Monitor compliance, report irregularities, educate stakeholders', ARRAY['Compliance monitoring', 'Irregularity reporting', 'Stakeholder education'])
ON CONFLICT (code) DO NOTHING;

-- Insert role-permission mappings
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin'::app_role, id FROM public.permissions ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'membership_officer'::app_role, id FROM public.permissions WHERE code IN ('approve_applications', 'view_payments', 'view_analytics', 'generate_certificate', 'reply_support') ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'finance_officer'::app_role, id FROM public.permissions WHERE code IN ('view_payments', 'view_analytics') ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'director'::app_role, id FROM public.permissions WHERE code IN ('manage_departments', 'manage_staff', 'view_analytics', 'approve_applications', 'manage_meetings', 'view_audit_logs') ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'head_of_unit'::app_role, id FROM public.permissions WHERE code IN ('assign_tasks', 'upload_documents', 'view_payments', 'generate_certificate', 'view_analytics') ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'assistant'::app_role, id FROM public.permissions WHERE code IN ('upload_documents', 'reply_support') ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'secretary'::app_role, id FROM public.permissions WHERE code IN ('manage_meetings', 'upload_documents') ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'support_worker'::app_role, id FROM public.permissions WHERE code IN ('reply_support') ON CONFLICT DO NOTHING;