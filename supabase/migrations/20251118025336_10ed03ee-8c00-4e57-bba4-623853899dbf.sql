-- Fix security issues: Only add missing items

-- Add server-side validation constraints for appointments table
DO $$ 
BEGIN
  -- Add constraints if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_date_future') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointment_date_future CHECK (appointment_date > now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_duration_valid') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointment_duration_valid CHECK (duration_minutes >= 15 AND duration_minutes <= 240);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_purpose_length') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointment_purpose_length CHECK (char_length(purpose) <= 500);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_type_valid') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointment_type_valid CHECK (appointment_type IN ('in-person', 'virtual'));
  END IF;
END $$;

-- Add indexes for better performance on staff_assignments region/district lookups
CREATE INDEX IF NOT EXISTS idx_staff_assignments_region_district ON staff_assignments(region, district);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_role ON staff_assignments(user_id, role);
