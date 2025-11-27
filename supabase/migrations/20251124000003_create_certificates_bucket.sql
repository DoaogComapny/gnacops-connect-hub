-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for certificates bucket
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
CREATE POLICY "Anyone can view certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Service role can upload certificates" ON storage.objects;
CREATE POLICY "Service role can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Service role can update certificates" ON storage.objects;
CREATE POLICY "Service role can update certificates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Service role can delete certificates" ON storage.objects;
CREATE POLICY "Service role can delete certificates"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'certificates');

