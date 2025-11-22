-- Add secondary pricing fields to form_categories for institutional membership dual payment system
ALTER TABLE public.form_categories
ADD COLUMN IF NOT EXISTS secondary_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS secondary_price_label TEXT DEFAULT NULL;

COMMENT ON COLUMN public.form_categories.secondary_price IS 'Secondary price amount (e.g., for SMS/LMS add-on) that goes to separate Paystack account';
COMMENT ON COLUMN public.form_categories.secondary_price_label IS 'Label for secondary price (e.g., "School Management System Fee")';