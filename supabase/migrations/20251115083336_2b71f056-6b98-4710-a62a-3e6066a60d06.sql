-- Create storage bucket for office documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('office-documents', 'office-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for office-documents bucket
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "Authenticated users can view documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'office-documents' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'office-documents' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their documents" ON storage.objects;
CREATE POLICY "Users can update their documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'office-documents' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete their documents" ON storage.objects;
CREATE POLICY "Users can delete their documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'office-documents' AND auth.uid() IS NOT NULL);