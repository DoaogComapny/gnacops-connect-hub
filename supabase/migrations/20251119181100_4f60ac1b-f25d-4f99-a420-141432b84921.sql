-- Insert missing permissions for the system
INSERT INTO public.permissions (code, name, description, module) VALUES
  ('approve_bookings', 'Approve Bookings', 'Approve or reject appointment bookings', 'office_management'),
  ('manage_appointments', 'Manage Appointments', 'Manage appointment calendar and scheduling', 'office_management'),
  ('view_calendar', 'View Calendar', 'View appointment calendar', 'office_management'),
  ('edit_website_content', 'Edit Website Content', 'Edit website pages and content', 'both'),
  ('manage_documents', 'Manage Documents', 'Upload and manage documents', 'office_management'),
  ('view_reports', 'View Reports', 'View system reports and analytics', 'both')
ON CONFLICT (code) DO NOTHING;