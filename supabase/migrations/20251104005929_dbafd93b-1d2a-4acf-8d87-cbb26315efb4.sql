-- Delete all demo/test data from the system
-- Only keep the structure intact

-- Delete support messages
DELETE FROM public.support_messages;

-- Delete support tickets
DELETE FROM public.support_tickets;

-- Delete form submissions
DELETE FROM public.form_submissions;

-- Delete payments
DELETE FROM public.payments;

-- Delete certificates
DELETE FROM public.certificates;

-- Delete memberships
DELETE FROM public.memberships;

-- Reset membership serials
DELETE FROM public.membership_serials;

-- Delete profiles (but keep admin)
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- Delete auth users (but keep admin) - This will cascade delete related records
DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);