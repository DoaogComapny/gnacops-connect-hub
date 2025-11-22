-- Create department staff assignments table
CREATE TABLE IF NOT EXISTS public.department_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_code TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, department_code)
);

-- Enable RLS
ALTER TABLE public.department_staff_assignments ENABLE ROW LEVEL SECURITY;

-- Department staff can view own assignment
CREATE POLICY "Department staff can view own assignment"
ON public.department_staff_assignments
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all assignments  
CREATE POLICY "Admins can manage department assignments"
ON public.department_staff_assignments
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create index for performance
CREATE INDEX idx_department_staff_user ON public.department_staff_assignments(user_id);
CREATE INDEX idx_department_staff_dept ON public.department_staff_assignments(department_code);