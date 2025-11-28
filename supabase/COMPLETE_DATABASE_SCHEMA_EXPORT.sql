-- =====================================================
-- GNACOPS COMPLETE DATABASE SCHEMA EXPORT
-- =====================================================
-- This file contains the complete database schema including:
-- - All tables
-- - All enums
-- - All functions
-- - All triggers
-- - All RLS policies
-- - All indexes
-- - Initial seed data
--
-- To use: Run this entire file in a fresh Supabase project
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CUSTOM TYPES & ENUMS
-- =====================================================

-- App roles enum
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'super_admin',
  'user',
  'secretary',
  'regional_coordinator',
  'district_coordinator',
  'director',
  'head_of_unit',
  'assistant',
  'support_worker',
  'membership_officer',
  'finance_officer',
  'vendor'
);

-- =====================================================
-- 3. CORE TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'pending_payment',
  email_verified BOOLEAN DEFAULT false,
  paid_until TIMESTAMP WITH TIME ZONE,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL CHECK (module IN ('membership', 'office_management', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (role, permission_id)
);

-- User module access table
CREATE TABLE public.user_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('membership', 'office_management')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, module)
);

-- Staff assignments table
CREATE TABLE public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  region TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  module TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. MEMBERSHIP SYSTEM TABLES
-- =====================================================

-- Form categories (membership types)
CREATE TABLE public.form_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  secondary_price NUMERIC DEFAULT 0,
  secondary_price_label TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Form questions
CREATE TABLE public.form_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.form_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  repeatable_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Memberships
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.form_categories(id),
  gnacops_id TEXT NOT NULL UNIQUE,
  region TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Membership serials
CREATE TABLE public.membership_serials (
  category_id UUID PRIMARY KEY REFERENCES public.form_categories(id) ON DELETE CASCADE,
  last_serial INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Form submissions
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.form_categories(id) NOT NULL,
  membership_id UUID REFERENCES public.memberships(id) NOT NULL,
  submission_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  membership_id UUID REFERENCES public.memberships(id) NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Certificate templates
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.form_categories(id),
  template_html TEXT NOT NULL,
  template_config JSONB,
  background_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  membership_id UUID REFERENCES public.memberships(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GHS',
  payment_method TEXT DEFAULT 'paystack',
  paystack_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  plan_id UUID,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 5. APPOINTMENTS & SECRETARY SYSTEM
-- =====================================================

-- Available dates
CREATE TABLE public.available_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  secretary_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  google_calendar_event_id TEXT,
  meeting_link TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email analytics
CREATE TABLE public.email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 6. SUPPORT SYSTEM
-- =====================================================

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Support messages
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_staff_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 7. OFFICE MANAGEMENT SYSTEM
-- =====================================================

-- GNACOPS Units
CREATE TABLE public.gnacops_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  responsibilities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  unit_id UUID REFERENCES public.gnacops_units(id),
  parent_department_id UUID REFERENCES public.departments(id),
  head_user_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Department staff assignments
CREATE TABLE public.department_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  department_code TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  department_id UUID REFERENCES public.departments(id),
  unit_id UUID REFERENCES public.gnacops_units(id),
  assigned_to UUID,
  assigned_by UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Task comments
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id),
  user_id UUID,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  tags TEXT[],
  department_id UUID REFERENCES public.departments(id),
  unit_id UUID REFERENCES public.gnacops_units(id),
  uploaded_by UUID,
  is_public BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document access log
CREATE TABLE public.document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id),
  user_id UUID,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Policies
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  department_id UUID REFERENCES public.departments(id),
  created_by UUID,
  approved_by UUID,
  deadline TIMESTAMP WITH TIME ZONE,
  implementation_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- School registrations
CREATE TABLE public.school_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  registration_number TEXT,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  school_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  registration_data JSONB DEFAULT '{}'::jsonb,
  verified_by UUID,
  license_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- School inspections
CREATE TABLE public.school_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID,
  inspection_date TIMESTAMP WITH TIME ZONE NOT NULL,
  inspector_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled',
  findings TEXT,
  recommendations TEXT,
  compliance_score INTEGER,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant applications
CREATE TABLE public.grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_school_id UUID,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  application_data JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Support cases
CREATE TABLE public.support_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  school_id UUID,
  assigned_to UUID,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Curriculum resources
CREATE TABLE public.curriculum_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- School flags
CREATE TABLE public.school_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  coordinator_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  notes TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coordinator notifications
CREATE TABLE public.coordinator_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id UUID NOT NULL,
  school_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 8. MARKETPLACE SYSTEM
-- =====================================================

-- Marketplace vendors
CREATE TABLE public.marketplace_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  identification_document TEXT,
  business_documents JSONB,
  social_media_links JSONB,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  commission_rate NUMERIC DEFAULT 0.15,
  wallet_balance NUMERIC DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace products
CREATE TABLE public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_percentage NUMERIC,
  sku TEXT,
  inventory_quantity INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_admin_approval BOOLEAN DEFAULT false,
  admin_approved BOOLEAN,
  admin_approved_by UUID,
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace product images
CREATE TABLE public.marketplace_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.marketplace_products(id) NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace cart
CREATE TABLE public.marketplace_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.marketplace_products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace orders
CREATE TABLE public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL,
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  total_amount NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  commission_amount NUMERIC,
  vendor_earnings NUMERIC,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  order_status TEXT NOT NULL DEFAULT 'placed',
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace order items
CREATE TABLE public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.marketplace_orders(id) NOT NULL,
  product_id UUID REFERENCES public.marketplace_products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace product reviews
CREATE TABLE public.marketplace_product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.marketplace_products(id) NOT NULL,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.marketplace_orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace delivery personnel
CREATE TABLE public.marketplace_delivery_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT,
  is_active BOOLEAN DEFAULT true,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace delivery assignments
CREATE TABLE public.marketplace_delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.marketplace_orders(id) NOT NULL,
  delivery_personnel_id UUID REFERENCES public.marketplace_delivery_personnel(id) NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  notes TEXT,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace wallet transactions
CREATE TABLE public.marketplace_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  order_id UUID REFERENCES public.marketplace_orders(id),
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace withdrawal requests
CREATE TABLE public.marketplace_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  amount NUMERIC NOT NULL,
  bank_details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace staff
CREATE TABLE public.marketplace_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace vendor staff
CREATE TABLE public.marketplace_vendor_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  staff_user_id UUID NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace onboarding questions
CREATE TABLE public.marketplace_onboarding_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text',
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace vendor applications
CREATE TABLE public.marketplace_vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  question_id UUID REFERENCES public.marketplace_onboarding_questions(id) NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace marketing materials
CREATE TABLE public.marketplace_marketing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.marketplace_vendors(id) NOT NULL,
  material_type TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false,
  admin_approved BOOLEAN,
  admin_approved_by UUID,
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 9. CMS & SITE SETTINGS
-- =====================================================

-- Site settings
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Editable pages
CREATE TABLE public.editable_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Page blocks
CREATE TABLE public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.editable_pages(id) NOT NULL,
  block_type TEXT NOT NULL,
  block_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gallery items
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Education TV videos
CREATE TABLE public.education_tv_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Header links
CREATE TABLE public.header_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Footer quick links
CREATE TABLE public.footer_quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Footer legal links
CREATE TABLE public.footer_legal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Footer social links
CREATE TABLE public.footer_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email verifications
CREATE TABLE public.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 10. SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_code TEXT)
RETURNS BOOLEAN
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

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(permission_code TEXT, permission_name TEXT, module TEXT)
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

-- Function to log audit trail
CREATE OR REPLACE FUNCTION public.log_audit(
  _user_id UUID,
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _old_data JSONB DEFAULT NULL,
  _new_data JSONB DEFAULT NULL,
  _module TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, module)
  VALUES (_user_id, _action, _entity_type, _entity_id, _old_data, _new_data, _module)
  RETURNING id INTO _audit_id;
  RETURN _audit_id;
END;
$$;

-- Function to get next membership serial
CREATE OR REPLACE FUNCTION public.next_membership_serial(_category_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_serial INTEGER;
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  
  -- Add default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to check payment expiry
CREATE OR REPLACE FUNCTION public.check_payment_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark users as expired if their paid_until date has passed
  UPDATE profiles
  SET status = 'expired'
  WHERE status = 'active'
    AND paid_until IS NOT NULL
    AND paid_until < NOW();
  
  RETURN NULL;
END;
$$;

-- =====================================================
-- 11. TRIGGERS
-- =====================================================

-- Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on memberships
CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on certificate_templates
CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on staff_assignments
CREATE TRIGGER update_staff_assignments_updated_at
  BEFORE UPDATE ON public.staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnacops_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_delivery_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_onboarding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_marketing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editable_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_tv_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.header_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_legal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Permissions policies
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Form categories policies
CREATE POLICY "Anyone can view active form categories" ON public.form_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage form categories" ON public.form_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Form questions policies
CREATE POLICY "Anyone can view form questions" ON public.form_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage form questions" ON public.form_questions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Memberships policies
CREATE POLICY "Users can view own memberships" ON public.memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all memberships" ON public.memberships FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Form submissions policies
CREATE POLICY "Users can view own submissions" ON public.form_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.form_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON public.form_submissions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT WITH CHECK ((auth.uid() = user_id) AND (status = 'pending'));
CREATE POLICY "Users can cancel own appointments" ON public.appointments FOR UPDATE USING ((auth.uid() = user_id) AND (status = 'pending')) WITH CHECK (status = 'cancelled');
CREATE POLICY "Secretaries can manage appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Available dates policies
CREATE POLICY "Anyone can view available dates" ON public.available_dates FOR SELECT USING (true);
CREATE POLICY "Secretaries can manage available dates" ON public.available_dates FOR ALL USING (has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Marketplace vendors policies
CREATE POLICY "Vendors can view own profile" ON public.marketplace_vendors FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Vendors can update own profile" ON public.marketplace_vendors FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Anyone can create vendor application" ON public.marketplace_vendors FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all vendors" ON public.marketplace_vendors FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Marketplace products policies
CREATE POLICY "Anyone can view active products" ON public.marketplace_products FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can manage own products" ON public.marketplace_products FOR ALL USING (vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all products" ON public.marketplace_products FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Marketplace cart policies
CREATE POLICY "Users can manage own cart" ON public.marketplace_cart FOR ALL USING (user_id = auth.uid());

-- Marketplace orders policies
CREATE POLICY "Users can view own orders" ON public.marketplace_orders FOR SELECT USING (buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Users can create orders" ON public.marketplace_orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Vendors can update own orders" ON public.marketplace_orders FOR UPDATE USING (vendor_id IN (SELECT id FROM marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all orders" ON public.marketplace_orders FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (has_role(auth.uid(), 'admin'));

-- News policies
CREATE POLICY "Anyone can view published news" ON public.news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Events policies
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Gallery policies
CREATE POLICY "Anyone can view gallery" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_items FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Education TV policies
CREATE POLICY "Anyone can view published videos" ON public.education_tv_videos FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage videos" ON public.education_tv_videos FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Team members policies
CREATE POLICY "Anyone can view active team members" ON public.team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Footer/Header links policies
CREATE POLICY "Anyone can view header links" ON public.header_links FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage header links" ON public.header_links FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view footer quick links" ON public.footer_quick_links FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage footer quick links" ON public.footer_quick_links FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view footer legal links" ON public.footer_legal_links FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage footer legal links" ON public.footer_legal_links FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view social links" ON public.footer_social_links FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage social links" ON public.footer_social_links FOR ALL USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- 13. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_gnacops_id ON public.memberships(gnacops_id);
CREATE INDEX idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_membership_id ON public.payments(membership_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_staff_assignments_user_id ON public.staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_region ON public.staff_assignments(region);
CREATE INDEX idx_staff_assignments_district ON public.staff_assignments(district);
CREATE INDEX idx_marketplace_products_vendor_id ON public.marketplace_products(vendor_id);
CREATE INDEX idx_marketplace_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX idx_marketplace_orders_vendor_id ON public.marketplace_orders(vendor_id);
CREATE INDEX idx_marketplace_cart_user_id ON public.marketplace_cart(user_id);

-- =====================================================
-- 14. INITIAL SEED DATA
-- =====================================================

-- Insert initial site settings
INSERT INTO public.site_settings (settings_data) VALUES ('{
  "siteName": "GNACOPS",
  "siteDescription": "Ghana National Council of Private Schools",
  "contactEmail": "info@gnacops.org",
  "contactPhone": "+233-XXX-XXXXXX",
  "enableSecondaryPricing": true
}'::jsonb);

-- Insert GNACOPS units
INSERT INTO public.gnacops_units (code, name, description, responsibilities) VALUES
('CPDU', 'Coordination & Policy Development Unit', 'Maintains school database, develops policies, engages with MoE/GES', ARRAY['School database management', 'Policy development', 'Government engagement']),
('ESCU', 'Educational Standards & Compliance Unit', 'Teacher licensing, accreditation, internal training', ARRAY['Teacher licensing', 'School accreditation', 'Training programs']),
('FSDSU', 'Financial Sustainability & Development Support Unit', 'Funding models, loans, partnerships', ARRAY['Financial planning', 'Loan facilitation', 'Partnership development']),
('CSEDU', 'Curriculum Standardization & Educational Development Unit', 'Align curricula, assessments, resources', ARRAY['Curriculum alignment', 'Assessment development', 'Resource provision']),
('RISEU', 'Research, Innovation & Stakeholder Engagement Unit', 'Policy research, stakeholder engagement, EduTech', ARRAY['Research', 'Innovation', 'Stakeholder engagement']),
('SSAU', 'Support Services & Advocacy Unit', 'Dispute resolution, health programs, legal support', ARRAY['Dispute resolution', 'Health programs', 'Legal support']),
('PECU', 'Private Education & Compliance Unit', 'Compliance monitoring, irregularity reporting', ARRAY['Compliance monitoring', 'Reporting', 'Education']);

-- Insert core permissions
INSERT INTO public.permissions (code, name, description, module) VALUES
('generate_certificate', 'Generate Certificate', 'Ability to generate membership certificates', 'membership'),
('reply_support_tickets', 'Reply to Support Tickets', 'Ability to respond to user support tickets', 'membership'),
('manage_users', 'Manage Users', 'Ability to view and modify user accounts', 'membership'),
('approve_applications', 'Approve Applications', 'Ability to approve/reject membership applications', 'membership'),
('view_payments', 'View Payments', 'Ability to view payment records and transactions', 'membership'),
('view_analytics', 'View Analytics', 'Ability to view system analytics and reports', 'both'),
('manage_staff', 'Manage Staff', 'Ability to create and manage staff accounts', 'both'),
('forgot_id_password', 'Reset Credentials', 'Ability to reset user IDs and passwords', 'membership'),
('manage_appointments', 'Manage Appointments', 'Ability to approve/manage appointment bookings', 'membership'),
('edit_content', 'Edit Content', 'Ability to edit website content and pages', 'both'),
('manage_departments', 'Manage Departments', 'Ability to manage department structure', 'office_management'),
('manage_tasks', 'Manage Tasks', 'Ability to create and assign tasks', 'office_management'),
('view_documents', 'View Documents', 'Ability to view department documents', 'office_management'),
('upload_documents', 'Upload Documents', 'Ability to upload documents', 'office_management'),
('approve_policies', 'Approve Policies', 'Ability to approve policy documents', 'office_management');

-- Assign permissions to roles
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'secretary', id FROM public.permissions WHERE code IN (
  'generate_certificate',
  'reply_support_tickets',
  'manage_users',
  'approve_applications',
  'view_payments',
  'view_analytics',
  'manage_appointments',
  'forgot_id_password'
);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- To export data from existing tables, use pg_dump:
-- pg_dump -h your-host -U your-user -d your-database -t public.table_name --data-only > data.sql
