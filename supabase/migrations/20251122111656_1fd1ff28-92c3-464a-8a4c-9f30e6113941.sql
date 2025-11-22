-- Drop the overly permissive "Anyone can view roles" policy
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;

-- Add restrictive policies for viewing roles
DO $$ 
BEGIN
  -- Users can view their own roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;

  -- Admins can view all roles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Admins can view all user roles'
  ) THEN
    CREATE POLICY "Admins can view all user roles"
      ON public.user_roles
      FOR SELECT
      TO public
      USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
  END IF;
END $$;