-- Fix RLS for payment_expiry_checks table
ALTER TABLE payment_expiry_checks ENABLE ROW LEVEL SECURITY;

-- Only admins can manage expiry checks
CREATE POLICY "Admins can manage expiry checks"
ON payment_expiry_checks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));