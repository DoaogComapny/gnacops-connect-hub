-- ============================================
-- CRITICAL SECURITY FIXES - Production Readiness
-- ============================================

-- Fix 1: Strengthen profiles RLS - users can only see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Fix 2: Restrict email_verifications - remove public insert, backend only
DROP POLICY IF EXISTS "Anyone can insert verifications" ON public.email_verifications;
CREATE POLICY "System can insert verifications" ON public.email_verifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Fix 3: Add RLS policies to tables without them
-- marketplace_product_images
ALTER TABLE public.marketplace_product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images" ON public.marketplace_product_images
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage own product images" ON public.marketplace_product_images
  FOR ALL USING (
    product_id IN (
      SELECT id FROM public.marketplace_products
      WHERE vendor_id IN (
        SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()
      )
    )
  );

-- marketplace_delivery_personnel
ALTER TABLE public.marketplace_delivery_personnel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage delivery personnel" ON public.marketplace_delivery_personnel
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Delivery personnel can view own profile" ON public.marketplace_delivery_personnel
  FOR SELECT USING (user_id = auth.uid());

-- marketplace_staff
ALTER TABLE public.marketplace_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketplace staff" ON public.marketplace_staff
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Staff can view own assignment" ON public.marketplace_staff
  FOR SELECT USING (user_id = auth.uid());

-- Fix 4: Create department tables for office management dashboards
-- Policies table for policy management (CPDU)
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rejected', 'implemented')),
  department_id UUID REFERENCES public.departments(id),
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  implementation_progress INTEGER DEFAULT 0 CHECK (implementation_progress >= 0 AND implementation_progress <= 100)
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Department members can view policies" ON public.policies
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role) OR
    has_role(auth.uid(), 'head_of_unit'::app_role)
  );

CREATE POLICY "Department members can create policies" ON public.policies
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Department members can update own policies" ON public.policies
  FOR UPDATE USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'director'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- School inspections table (ESCU)
CREATE TABLE IF NOT EXISTS public.school_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.form_submissions(id),
  inspection_date TIMESTAMPTZ NOT NULL,
  inspector_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  report_url TEXT,
  findings TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.school_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inspectors can manage inspections" ON public.school_inspections
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role) OR
    inspector_id = auth.uid()
  );

-- Grant applications table (FSDSU)
CREATE TABLE IF NOT EXISTS public.grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  applicant_school_id UUID REFERENCES public.form_submissions(id),
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'disbursed')),
  application_data JSONB DEFAULT '{}',
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ
);

ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance officers can manage grants" ON public.grant_applications
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role) OR
    has_role(auth.uid(), 'finance_officer'::app_role)
  );

-- Curriculum resources table (CSEDU)
CREATE TABLE IF NOT EXISTS public.curriculum_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('curriculum', 'lesson_plan', 'assessment', 'training_material')),
  version TEXT NOT NULL DEFAULT '1.0',
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.curriculum_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view published resources" ON public.curriculum_resources
  FOR SELECT USING (
    status = 'published' OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role)
  );

CREATE POLICY "Staff can create resources" ON public.curriculum_resources
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Research projects table (RISEU)
CREATE TABLE IF NOT EXISTS public.research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'published')),
  lead_researcher_id UUID REFERENCES public.profiles(id),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  findings TEXT,
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can manage projects" ON public.research_projects
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role) OR
    lead_researcher_id = auth.uid()
  );

-- Support cases table (SSAU)
CREATE TABLE IF NOT EXISTS public.support_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.form_submissions(id),
  case_type TEXT NOT NULL CHECK (case_type IN ('welfare', 'dispute', 'complaint', 'assistance', 'advocacy')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support staff can manage cases" ON public.support_cases
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role) OR
    has_role(auth.uid(), 'support_worker'::app_role) OR
    assigned_to = auth.uid()
  );

-- School registrations table (PECU)
CREATE TABLE IF NOT EXISTS public.school_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  school_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved', 'rejected', 'suspended')),
  license_expiry TIMESTAMPTZ,
  registration_data JSONB DEFAULT '{}',
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.school_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registration staff can manage registrations" ON public.school_registrations
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'director'::app_role) OR
    has_role(auth.uid(), 'membership_officer'::app_role)
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_policies_updated_at ON public.policies;
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_school_inspections_updated_at ON public.school_inspections;
CREATE TRIGGER update_school_inspections_updated_at BEFORE UPDATE ON public.school_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_grant_applications_updated_at ON public.grant_applications;
CREATE TRIGGER update_grant_applications_updated_at BEFORE UPDATE ON public.grant_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_curriculum_resources_updated_at ON public.curriculum_resources;
CREATE TRIGGER update_curriculum_resources_updated_at BEFORE UPDATE ON public.curriculum_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_projects_updated_at ON public.research_projects;
CREATE TRIGGER update_research_projects_updated_at BEFORE UPDATE ON public.research_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_cases_updated_at ON public.support_cases;
CREATE TRIGGER update_support_cases_updated_at BEFORE UPDATE ON public.support_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_school_registrations_updated_at ON public.school_registrations;
CREATE TRIGGER update_school_registrations_updated_at BEFORE UPDATE ON public.school_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_department ON public.policies(department_id);
CREATE INDEX IF NOT EXISTS idx_school_inspections_school ON public.school_inspections(school_id);
CREATE INDEX IF NOT EXISTS idx_school_inspections_date ON public.school_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_grant_applications_status ON public.grant_applications(status);
CREATE INDEX IF NOT EXISTS idx_curriculum_resources_type ON public.curriculum_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON public.research_projects(status);
CREATE INDEX IF NOT EXISTS idx_support_cases_status ON public.support_cases(status);
CREATE INDEX IF NOT EXISTS idx_school_registrations_status ON public.school_registrations(status);