-- Create sync_logs table for tracking Google Calendar sync status
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'appointment', 'available_date', 'calendar_event'
  entity_id UUID, -- references appointments or available_dates
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  google_event_id TEXT,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create recurring_appointments table
CREATE TABLE IF NOT EXISTS public.recurring_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  appointment_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  purpose TEXT NOT NULL,
  recurrence_pattern TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  recurrence_interval INTEGER NOT NULL DEFAULT 1, -- every X days/weeks/months
  start_date DATE NOT NULL,
  end_date DATE, -- null for indefinite
  days_of_week INTEGER[], -- for weekly: [0,1,2,3,4,5,6] where 0=Sunday
  time_of_day TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL, -- 'appointment_approved', 'appointment_rejected', 'reminder', 'welcome'
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB, -- list of available variables like {{userName}}, {{appointmentDate}}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for sync_logs
CREATE POLICY "Secretaries can view sync logs"
  ON public.sync_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'secretary'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can insert sync logs"
  ON public.sync_logs FOR INSERT
  WITH CHECK (true);

-- RLS policies for recurring_appointments
CREATE POLICY "Users can view own recurring appointments"
  ON public.recurring_appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create recurring appointments"
  ON public.recurring_appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secretaries can manage recurring appointments"
  ON public.recurring_appointments FOR ALL
  USING (
    has_role(auth.uid(), 'secretary'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS policies for email_templates
CREATE POLICY "Anyone can view active templates"
  ON public.email_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Insert default email templates
INSERT INTO public.email_templates (template_key, subject, html_body, variables) VALUES
('appointment_approved', 'Appointment Approved - GNACOPS', 
'<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#f4b942;color:#000;padding:20px;text-align:center}.content{padding:20px;background:#f9f9f9}.button{display:inline-block;padding:12px 24px;background:#f4b942;color:#000;text-decoration:none;border-radius:5px;margin-top:15px}</style></head><body><div class="container"><div class="header"><h1>Appointment Approved</h1></div><div class="content"><p>Dear {{userName}},</p><p>Your appointment request has been approved!</p><p><strong>Appointment Details:</strong></p><ul><li><strong>Type:</strong> {{appointmentType}}</li><li><strong>Date & Time:</strong> {{appointmentDate}}</li><li><strong>Duration:</strong> {{duration}} minutes</li><li><strong>Purpose:</strong> {{purpose}}</li></ul>{{#if meetingLink}}<p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>{{/if}}{{#if secretaryNotes}}<p><strong>Notes:</strong> {{secretaryNotes}}</p>{{/if}}<p>Thank you for choosing GNACOPS.</p></div></div></body></html>',
'{"userName": "User full name", "appointmentType": "virtual or in-person", "appointmentDate": "Date and time", "duration": "Duration in minutes", "purpose": "Appointment purpose", "meetingLink": "Virtual meeting link", "secretaryNotes": "Notes from secretary"}'::jsonb),

('appointment_rejected', 'Appointment Request - GNACOPS',
'<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#dc2626;color:#fff;padding:20px;text-align:center}.content{padding:20px;background:#f9f9f9}</style></head><body><div class="container"><div class="header"><h1>Appointment Update</h1></div><div class="content"><p>Dear {{userName}},</p><p>Unfortunately, we are unable to accommodate your appointment request at the requested time.</p><p><strong>Original Request:</strong></p><ul><li><strong>Type:</strong> {{appointmentType}}</li><li><strong>Date & Time:</strong> {{appointmentDate}}</li><li><strong>Purpose:</strong> {{purpose}}</li></ul>{{#if secretaryNotes}}<p><strong>Reason:</strong> {{secretaryNotes}}</p>{{/if}}<p>Please feel free to submit a new appointment request with alternative dates.</p></div></div></body></html>',
'{"userName": "User full name", "appointmentType": "virtual or in-person", "appointmentDate": "Date and time", "purpose": "Appointment purpose", "secretaryNotes": "Reason for rejection"}'::jsonb);

-- Create indexes for performance
CREATE INDEX idx_sync_logs_entity ON public.sync_logs(entity_id, sync_type);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status, created_at);
CREATE INDEX idx_recurring_appointments_active ON public.recurring_appointments(is_active, start_date) WHERE is_active = true;
CREATE INDEX idx_email_templates_key ON public.email_templates(template_key) WHERE is_active = true;