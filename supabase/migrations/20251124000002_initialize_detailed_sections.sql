-- Initialize detailedSections in aboutPage settings
-- This migration ensures the detailedSections array exists as an empty array

DO $$
DECLARE
  settings_id uuid;
  current_data jsonb;
  updated_data jsonb;
BEGIN
  -- Get existing settings record
  SELECT id, settings_data INTO settings_id, current_data
  FROM site_settings
  LIMIT 1;

  -- If no settings exist, create new one with empty detailedSections
  IF settings_id IS NULL THEN
    INSERT INTO site_settings (settings_data)
    VALUES (jsonb_build_object('aboutPage', jsonb_build_object('detailedSections', '[]'::jsonb)))
    RETURNING id INTO settings_id;
  ELSE
    -- Update existing settings
    current_data := COALESCE(current_data, '{}'::jsonb);
    
    -- Ensure aboutPage exists
    IF current_data->'aboutPage' IS NULL THEN
      current_data := current_data || jsonb_build_object('aboutPage', jsonb_build_object('detailedSections', '[]'::jsonb));
    ELSE
      -- Ensure detailedSections exists and is an array
      IF current_data->'aboutPage'->'detailedSections' IS NULL 
         OR jsonb_typeof(current_data->'aboutPage'->'detailedSections') != 'array' THEN
        current_data := jsonb_set(
          current_data,
          '{aboutPage,detailedSections}',
          '[]'::jsonb,
          true
        );
      END IF;
    END IF;

    -- Update the record
    UPDATE site_settings
    SET settings_data = current_data,
        updated_at = now()
    WHERE id = settings_id;
  END IF;
END $$;

-- Verify the structure
SELECT 
  id,
  jsonb_pretty(settings_data->'aboutPage'->'detailedSections') as detailed_sections,
  updated_at
FROM site_settings
LIMIT 1;

