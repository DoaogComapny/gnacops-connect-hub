-- First migration: Add new coordinator roles to enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'district_coordinator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'regional_coordinator';