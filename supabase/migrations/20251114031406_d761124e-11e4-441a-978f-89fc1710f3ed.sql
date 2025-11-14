-- Phase 2: Office Management Module Tables

-- 1. Departments table (links to gnacops_units)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.gnacops_units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  head_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.gnacops_units(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tags TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.gnacops_units(id) ON DELETE SET NULL,
  category TEXT, -- 'policy', 'report', 'form', 'template', 'other'
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Task comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Document access log table
CREATE TABLE IF NOT EXISTS public.document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'view', 'download', 'edit'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
DROP POLICY IF EXISTS "Anyone authenticated can view departments" ON public.departments;
CREATE POLICY "Anyone authenticated can view departments"
  ON public.departments FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'director'::app_role));

-- RLS Policies for tasks
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON public.tasks;
CREATE POLICY "Users can view tasks assigned to them"
  ON public.tasks FOR SELECT
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = assigned_by);

DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
CREATE POLICY "Users can update their tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;
CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for documents
DROP POLICY IF EXISTS "Users can view accessible documents" ON public.documents;
CREATE POLICY "Users can view accessible documents"
  ON public.documents FOR SELECT
  USING (is_public = true OR auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Authorized users can upload documents" ON public.documents;
CREATE POLICY "Authorized users can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Uploaders and admins can update documents" ON public.documents;
CREATE POLICY "Uploaders and admins can update documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Uploaders and admins can delete documents" ON public.documents;
CREATE POLICY "Uploaders and admins can delete documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for task_comments
DROP POLICY IF EXISTS "Users can view comments on their tasks" ON public.task_comments;
CREATE POLICY "Users can view comments on their tasks"
  ON public.task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_comments.task_id
        AND (tasks.assigned_to = auth.uid() OR tasks.assigned_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

DROP POLICY IF EXISTS "Users can add comments to their tasks" ON public.task_comments;
CREATE POLICY "Users can add comments to their tasks"
  ON public.task_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for document_access_log
DROP POLICY IF EXISTS "Admins can view access logs" ON public.document_access_log;
CREATE POLICY "Admins can view access logs"
  ON public.document_access_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "System can log access" ON public.document_access_log;
CREATE POLICY "System can log access"
  ON public.document_access_log FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_unit_id ON public.departments(unit_id);
CREATE INDEX IF NOT EXISTS idx_departments_head_user_id ON public.departments(head_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON public.documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_document_id ON public.document_access_log(document_id);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample departments for each GNACOPS unit
INSERT INTO public.departments (unit_id, name, code, description) 
SELECT 
  id,
  'Main ' || name,
  code || '_MAIN',
  'Main department for ' || name
FROM public.gnacops_units
WHERE NOT EXISTS (
  SELECT 1 FROM public.departments WHERE departments.unit_id = gnacops_units.id
)
LIMIT 7;