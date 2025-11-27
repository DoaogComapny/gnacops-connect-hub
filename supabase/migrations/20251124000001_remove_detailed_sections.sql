-- Remove detailedSections from aboutPage settings
-- This migration completely removes the detailedSections field from the database

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

  -- If settings exist, remove detailedSections
  IF settings_id IS NOT NULL AND current_data IS NOT NULL THEN
    -- Check if aboutPage exists
    IF current_data->'aboutPage' IS NOT NULL THEN
      -- Remove detailedSections from aboutPage
      updated_data := current_data;
      
      -- Remove the detailedSections key from aboutPage
      updated_data := jsonb_set(
        updated_data,
        '{aboutPage}',
        (current_data->'aboutPage') - 'detailedSections'
      );

      -- Update the record
      UPDATE site_settings
      SET settings_data = updated_data,
          updated_at = now()
      WHERE id = settings_id;
    END IF;
  END IF;
END $$;

-- Verify the structure (detailedSections should be removed)
SELECT 
  id,
  jsonb_pretty(settings_data->'aboutPage') as about_page_structure,
  updated_at
FROM site_settings
LIMIT 1;

