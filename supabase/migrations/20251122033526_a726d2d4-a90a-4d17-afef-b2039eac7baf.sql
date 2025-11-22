-- Enable realtime for office management tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.policies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_inspections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.grant_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.curriculum_resources;