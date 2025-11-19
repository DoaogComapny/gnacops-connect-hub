-- Add tables for coordinator notifications and bulk actions

-- Table: coordinator_notifications
-- Stores automated notifications for coordinators about school events
CREATE TABLE IF NOT EXISTS public.coordinator_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- 'overdue_payment', 'expired_membership', 'new_registration', 'renewal_due'
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT valid_notification_type CHECK (notification_type IN ('overdue_payment', 'expired_membership', 'new_registration', 'renewal_due', 'compliance_issue'))
);

-- Table: school_flags
-- Stores coordinator flags and notes on schools requiring attention
CREATE TABLE IF NOT EXISTS public.school_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  coordinator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type text NOT NULL, -- 'follow_up', 'compliance_issue', 'payment_issue', 'documentation_needed'
  notes text,
  priority text DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status text DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT valid_flag_type CHECK (flag_type IN ('follow_up', 'compliance_issue', 'payment_issue', 'documentation_needed', 'other'))
);

-- Enable RLS
ALTER TABLE public.coordinator_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: coordinator_notifications
CREATE POLICY "Coordinators can view own notifications"
ON public.coordinator_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = coordinator_id);

CREATE POLICY "Coordinators can update own notifications"
ON public.coordinator_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = coordinator_id);

CREATE POLICY "System can insert notifications"
ON public.coordinator_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies: school_flags
CREATE POLICY "District coordinators can manage flags in their district"
ON public.school_flags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_assignments sa
    JOIN public.form_submissions fs ON fs.id = school_flags.school_id
    WHERE sa.user_id = auth.uid()
      AND sa.role = 'district_coordinator'::app_role
      AND sa.region = (fs.submission_data->>'region')
      AND sa.district = (fs.submission_data->>'district')
  )
);

CREATE POLICY "Regional coordinators can manage flags in their region"
ON public.school_flags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_assignments sa
    JOIN public.form_submissions fs ON fs.id = school_flags.school_id
    WHERE sa.user_id = auth.uid()
      AND sa.role = 'regional_coordinator'::app_role
      AND sa.region = (fs.submission_data->>'region')
  )
);

CREATE POLICY "Admins can manage all flags"
ON public.school_flags
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coordinator_notifications_coordinator 
ON public.coordinator_notifications (coordinator_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coordinator_notifications_school 
ON public.coordinator_notifications (school_id);

CREATE INDEX IF NOT EXISTS idx_school_flags_school 
ON public.school_flags (school_id, status);

CREATE INDEX IF NOT EXISTS idx_school_flags_coordinator 
ON public.school_flags (coordinator_id, status);

-- Add trigger to update updated_at on school_flags
CREATE TRIGGER update_school_flags_updated_at
BEFORE UPDATE ON public.school_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();