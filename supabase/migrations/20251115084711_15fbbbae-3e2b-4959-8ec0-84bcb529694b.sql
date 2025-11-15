-- Seed editable pages if they don't exist
INSERT INTO editable_pages (page_key, title, slug, is_published)
VALUES 
  ('team', 'The Team', 'team', true),
  ('services', 'Services', 'services', true),
  ('news', 'News', 'news', true),
  ('gallery', 'Gallery', 'gallery', true),
  ('events', 'Events', 'events', true),
  ('education-tv', 'Education TV', 'education-tv', true)
ON CONFLICT (page_key) DO NOTHING;

-- Phase 3: Create appointments table for booking system
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('in-person', 'virtual')),
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  secretary_notes TEXT,
  google_calendar_event_id TEXT,
  meeting_link TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users can view their own appointments
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create appointments
CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can cancel their own pending appointments
CREATE POLICY "Users can cancel own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Secretaries and admins can manage all appointments
CREATE POLICY "Secretaries can manage appointments"
  ON appointments FOR ALL
  USING (
    has_role(auth.uid(), 'secretary'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create index for efficient querying
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);