-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table (CRITICAL: Separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles"
  ON public.user_roles FOR SELECT
  USING (true);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Header links table
CREATE TABLE public.header_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.header_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view header links"
  ON public.header_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage header links"
  ON public.header_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Footer quick links table
CREATE TABLE public.footer_quick_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.footer_quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view footer quick links"
  ON public.footer_quick_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage footer quick links"
  ON public.footer_quick_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Footer social links table
CREATE TABLE public.footer_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL, -- facebook, twitter, instagram, linkedin, youtube
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.footer_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social links"
  ON public.footer_social_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage social links"
  ON public.footer_social_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Footer legal links table
CREATE TABLE public.footer_legal_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.footer_legal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view legal links"
  ON public.footer_legal_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage legal links"
  ON public.footer_legal_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Page content table (for About, Contact, etc.)
CREATE TABLE public.page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL, -- 'about', 'contact', 'hero', etc.
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page content"
  ON public.page_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage page content"
  ON public.page_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Form categories table
CREATE TABLE public.form_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'prime' or 'associate'
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.form_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active form categories"
  ON public.form_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage form categories"
  ON public.form_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Form questions table
CREATE TABLE public.form_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.form_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'short_text', 'long_text', 'boolean', 'multiple_choice', 'dropdown', 'file', 'number', 'date', 'repeatable'
  options JSONB, -- for multiple choice, dropdown
  is_required BOOLEAN DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  repeatable_config JSONB, -- for repeatable fields
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view form questions"
  ON public.form_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage form questions"
  ON public.form_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Memberships table (tracks user memberships and GNACOPS IDs)
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.form_categories(id) ON DELETE SET NULL,
  gnacops_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
  amount DECIMAL(10,2),
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships"
  ON public.memberships FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update memberships"
  ON public.memberships FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Form submissions table
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.form_categories(id) ON DELETE CASCADE NOT NULL,
  submission_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON public.form_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON public.form_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON public.form_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments table (Paystack only)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  payment_method TEXT DEFAULT 'paystack',
  paystack_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Certificate templates table
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  background_url TEXT,
  template_config JSONB NOT NULL, -- positions, styles for dynamic fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage certificate templates"
  ON public.certificate_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'closed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Support messages table (conversation history)
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own tickets"
  ON public.support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

CREATE POLICY "Users can create messages in own tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages"
  ON public.support_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create messages"
  ON public.support_messages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to create profile on signup
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

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default page content
INSERT INTO public.page_content (page_key, content) VALUES
('about', '{
  "title": "About GNACOPS",
  "intro": "Ghana National Council of Private Schools",
  "mission": "Our mission is to promote quality private education in Ghana",
  "vision": "To be the leading advocate for private schools in Ghana",
  "values": ["Excellence", "Integrity", "Innovation", "Collaboration"]
}'::jsonb),
('contact', '{
  "title": "Contact Us",
  "email": "info@gnacops.org",
  "phone": "+233 XX XXX XXXX",
  "address": "Accra, Ghana"
}'::jsonb),
('how_it_works', '{
  "steps": [
    {"title": "Fill Forms", "description": "Complete your membership application"},
    {"title": "Pay Membership Fee", "description": "Secure payment via Paystack"},
    {"title": "Admin Approval", "description": "We review your application"},
    {"title": "Get Certificate", "description": "Download your membership certificate"}
  ]
}'::jsonb);