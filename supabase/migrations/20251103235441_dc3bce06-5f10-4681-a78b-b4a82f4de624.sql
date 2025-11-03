-- Enable profile auto-creation on user signup and default role assignment
-- Create trigger to call existing function public.handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow admins to view all profiles; keep existing user-only policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Add email_verified flag to profiles for custom verification tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Unique index for memberships.gnacops_id to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_memberships_gnacops_id_unique ON public.memberships (gnacops_id);

-- Create membership serials table for safe, atomic serial generation per category
CREATE TABLE IF NOT EXISTS public.membership_serials (
  category_id uuid PRIMARY KEY,
  last_serial integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Function to atomically fetch next serial for a category
CREATE OR REPLACE FUNCTION public.next_membership_serial(_category_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_serial integer;
BEGIN
  INSERT INTO public.membership_serials (category_id, last_serial)
  VALUES (_category_id, 1)
  ON CONFLICT (category_id)
  DO UPDATE SET last_serial = public.membership_serials.last_serial + 1
  RETURNING last_serial INTO new_serial;

  UPDATE public.membership_serials SET updated_at = now() WHERE category_id = _category_id;
  RETURN new_serial;
END;
$$;