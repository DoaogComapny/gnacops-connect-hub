-- Fix RLS policies to explicitly allow anonymous (anon) access

-- Drop and recreate form_categories policy for public access
DROP POLICY IF EXISTS "Anyone can view active form categories" ON public.form_categories;
CREATE POLICY "Anyone can view active form categories"
  ON public.form_categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Drop and recreate site_settings policy for public access
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
CREATE POLICY "Anyone can view settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ensure header_links, footer_quick_links, footer_legal_links, and footer_social_links are accessible to anon users
DROP POLICY IF EXISTS "Anyone can view header links" ON public.header_links;
CREATE POLICY "Anyone can view header links"
  ON public.header_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view footer quick links" ON public.footer_quick_links;
CREATE POLICY "Anyone can view footer quick links"
  ON public.footer_quick_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view legal links" ON public.footer_legal_links;
CREATE POLICY "Anyone can view legal links"
  ON public.footer_legal_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view social links" ON public.footer_social_links;
CREATE POLICY "Anyone can view social links"
  ON public.footer_social_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);