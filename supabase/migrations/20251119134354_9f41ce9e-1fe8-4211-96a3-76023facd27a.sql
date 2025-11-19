-- Add secretary role to app_role enum (only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'secretary' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'secretary';
  END IF;
END $$;

-- Add secretary permissions to permissions table
INSERT INTO permissions (code, name, module, description) VALUES
  ('secretary.generate_certificates', 'Generate Certificates', 'membership', 'Generate and download PDF certificates'),
  ('secretary.reply_support_tickets', 'Reply to Support Tickets', 'membership', 'View and reply to member support tickets'),
  ('secretary.manage_users', 'Manage Users', 'membership', 'Update member details and reset passwords'),
  ('secretary.approve_applications', 'Approve Applications', 'membership', 'Review and approve/reject membership applications'),
  ('secretary.view_payments', 'View Payments', 'membership', 'View payment history and verify receipts'),
  ('secretary.edit_website', 'Edit Website Content', 'membership', 'Update website pages and content'),
  ('secretary.view_analytics', 'View Analytics', 'both', 'View membership and website analytics'),
  ('secretary.manage_staff', 'Manage Staff', 'both', 'Add, view, and update staff information'),
  ('secretary.manage_appointments', 'Manage Appointments', 'office_management', 'Approve and manage appointment bookings'),
  ('secretary.calendar_setup', 'Calendar Setup', 'office_management', 'Configure available appointment dates')
ON CONFLICT (code) DO NOTHING;

-- Assign all secretary permissions to secretary role
INSERT INTO role_permissions (role, permission_id)
SELECT 'secretary'::app_role, id
FROM permissions
WHERE code LIKE 'secretary.%'
ON CONFLICT DO NOTHING;

-- Create available_dates table for calendar management (only if not exists)
CREATE TABLE IF NOT EXISTS available_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on available_dates (idempotent)
ALTER TABLE available_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view available dates" ON available_dates;
DROP POLICY IF EXISTS "Secretaries can manage available dates" ON available_dates;

-- RLS Policies for available_dates
CREATE POLICY "Anyone can view available dates"
  ON available_dates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Secretaries can manage available dates"
  ON available_dates FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'secretary'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );