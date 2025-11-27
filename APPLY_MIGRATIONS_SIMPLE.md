# Quick Guide: Apply RLS Fix Migrations

Since Supabase CLI is not installed, use the **Supabase Dashboard** method below.

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Apply Migration 1 (staff_assignments)
1. Click **New Query**
2. Copy the entire content from: `supabase/migrations/20251123000000_fix_staff_assignments_rls_recursion.sql`
3. Paste it into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Apply Migration 2 (form_submissions)
1. Click **New Query** (or clear the previous one)
2. Copy the entire content from: `supabase/migrations/20251123000001_fix_form_submissions_rls_recursion.sql`
3. Paste it into the SQL Editor
4. Click **Run**
5. Wait for "Success" message

### Step 4: Apply Migration 3 (school_flags)
1. Click **New Query** (or clear the previous one)
2. Copy the entire content from: `supabase/migrations/20251123000002_fix_school_flags_rls_recursion.sql`
3. Paste it into the SQL Editor
4. Click **Run**
5. Wait for "Success" message

## Verification

After all 3 migrations are applied:

1. **Test Coordinator Pages:**
   - Login as a regional coordinator
   - Navigate to "District Coordinators" page
   - Should load without errors ✅

2. **Test Applications Page:**
   - Login as admin
   - Navigate to "Applications" page
   - Should load without errors ✅

3. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Look for any "infinite recursion" errors
   - Should see no such errors ✅

## Troubleshooting

If you get an error:
- Make sure you're applying migrations in order (1 → 2 → 3)
- Check that you copied the entire file content
- Look at the error message - it will tell you what went wrong
- Most errors are harmless (like "policy already exists") and can be ignored

## What These Migrations Fix

✅ Infinite recursion in `staff_assignments` RLS policies  
✅ Infinite recursion in `form_submissions` RLS policies  
✅ Infinite recursion in `school_flags` RLS policies  
✅ Coordinator fetching issues  
✅ Applications page loading issues  

---

**Note:** The migrations are safe to run multiple times - they use `DROP POLICY IF EXISTS` and `CREATE OR REPLACE FUNCTION` so they won't break if run again.

