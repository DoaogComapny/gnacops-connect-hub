-- Add user status and payment tracking fields
-- Add status field to profiles for payment-gated activation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'active', 'expired', 'blocked'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paid_until timestamp with time zone;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_at timestamp with time zone;

-- Add index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_paid_until ON profiles(paid_until) WHERE status = 'active';

-- Update existing users to active status (one-time migration)
UPDATE profiles SET status = 'active' WHERE status = 'pending_payment' AND id IN (
  SELECT DISTINCT user_id FROM memberships WHERE payment_status = 'paid'
);

-- Add payment_plan_id to payments for tracking what was purchased
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES form_categories(id);

-- Create function to check if payment is expired
CREATE OR REPLACE FUNCTION check_payment_expiry()
RETURNS trigger
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

-- Create a table for tracking payment expiry checks (for cron job simulation)
CREATE TABLE IF NOT EXISTS payment_expiry_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamp with time zone DEFAULT NOW(),
  expired_count integer DEFAULT 0
);