-- Create email analytics table for tracking email engagement
CREATE TABLE IF NOT EXISTS public.email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'appointment_approval', 'appointment_rejection', 'appointment_reminder', 'welcome'
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS policies for email_analytics
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Secretaries can view email analytics"
  ON public.email_analytics FOR SELECT
  USING (
    has_role(auth.uid(), 'secretary'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can insert email analytics"
  ON public.email_analytics FOR INSERT
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_analytics_appointment ON public.email_analytics(appointment_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_type ON public.email_analytics(email_type);
CREATE INDEX IF NOT EXISTS idx_email_analytics_sent ON public.email_analytics(sent_at);

-- Add reminder_sent flag to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;