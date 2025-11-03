-- Create site_settings table to store all configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can view settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.site_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default settings
INSERT INTO public.site_settings (settings_data) VALUES ('{
  "siteName": "GNACOPS",
  "tagline": "Ghana National Association of Council of Private Schools",
  "aboutText": "GNACOPS is committed to excellence...",
  "paymentProvider": "paystack",
  "heroTitle": "Join Ghana''s Private School Council Today",
  "heroSubtitle": "Empowering Excellence in Private Education Across Ghana",
  "aboutSectionTitle": "About GNACOPS",
  "aboutSectionText": "Ghana National Association of Council of Private Schools",
  "memberships": {
    "institutional": {
      "title": "Institutional Membership",
      "description": "For private schools and educational institutions seeking official registration and support.",
      "price": "500"
    },
    "teacher": {
      "title": "Teacher Council",
      "description": "Professional development and networking opportunities for dedicated educators.",
      "price": "200"
    },
    "parent": {
      "title": "Parent Council",
      "description": "Active parent involvement in shaping quality education for their children.",
      "price": "150"
    },
    "proprietor": {
      "title": "Proprietor",
      "description": "For school owners committed to excellence in private education management.",
      "price": "300"
    },
    "serviceProvider": {
      "title": "Service Provider",
      "description": "Partner with GNACOPS schools by offering essential educational services.",
      "price": "250"
    },
    "nonTeachingStaff": {
      "title": "Non-Teaching Staff",
      "description": "Recognition and support for vital non-teaching school personnel.",
      "price": "150"
    }
  },
  "howItWorks": [
    {
      "title": "Fill Forms",
      "description": "Complete your membership registration form with accurate details"
    },
    {
      "title": "Pay Membership Fee",
      "description": "Securely pay your membership fee through our payment gateway"
    },
    {
      "title": "Admin Approval",
      "description": "Wait for admin review and approval of your application"
    },
    {
      "title": "Get Certificate",
      "description": "Receive your GNACOPS ID and official membership certificate"
    }
  ],
  "footer": {
    "email": "info@gnacops.org",
    "phone": "+233 XX XXX XXXX",
    "address": "Accra, Ghana"
  },
  "aboutPage": {
    "title": "About GNACOPS",
    "intro": "The Ghana National Council of Private Schools (GNACOPS) is a premier organization dedicated to supporting and elevating private education standards across Ghana.",
    "mission": {
      "title": "Our Mission",
      "text": "To support, regulate, and elevate the standards of private educational institutions throughout Ghana, ensuring quality education for all students."
    },
    "vision": {
      "title": "Our Vision",
      "text": "A thriving private education sector that contributes significantly to Ghana''s educational excellence and national development."
    },
    "values": {
      "title": "Our Values",
      "items": ["Quality in Education", "Integrity and Transparency", "Innovation and Excellence", "Collaboration and Partnership"]
    }
  },
  "contactPage": {
    "title": "Contact Us",
    "email": "info@gnacops.org",
    "phone": "+233 XX XXX XXXX",
    "address": "Accra, Ghana"
  }
}'::jsonb);