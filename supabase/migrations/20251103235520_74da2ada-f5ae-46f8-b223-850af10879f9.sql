-- Enable RLS on membership_serials table
ALTER TABLE public.membership_serials ENABLE ROW LEVEL SECURITY;

-- Admin can manage serials
CREATE POLICY "Admins can manage membership serials"
ON public.membership_serials
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Edge functions (service role) can call next_membership_serial (already SECURITY DEFINER)