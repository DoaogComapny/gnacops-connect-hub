# How to Apply RLS Recursion Fix Migrations

This guide will help you apply the migrations that fix the infinite recursion issues in RLS policies.

## Problem Fixed

The following tables had RLS policies that were querying `staff_assignments` within their own policy checks, causing infinite recursion:
- `staff_assignments` - policies were querying themselves
- `form_submissions` - policies were querying `staff_assignments` 
- `school_flags` - policies were querying `staff_assignments`

## Migrations to Apply

Apply these migrations in order:

1. **20251123000000_fix_staff_assignments_rls_recursion.sql**
   - Fixes recursion in `staff_assignments` RLS policies
   - Creates non-recursive policies that check `user_roles` instead

2. **20251123000001_fix_form_submissions_rls_recursion.sql**
   - Fixes recursion in `form_submissions` RLS policies
   - Creates helper functions to safely get coordinator region/district
   - Creates non-recursive policies

3. **20251123000002_fix_school_flags_rls_recursion.sql**
   - Fixes recursion in `school_flags` RLS policies
   - Uses the helper functions from migration #2

## Method 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
cd "c:\gnacops project\gnacops-connect-hub\gnacops-connect-hub"
supabase db push
```

Or apply migrations individually:

```bash
supabase migration up
```

## Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open each migration file in order:
   - `supabase/migrations/20251123000000_fix_staff_assignments_rls_recursion.sql`
   - `supabase/migrations/20251123000001_fix_form_submissions_rls_recursion.sql`
   - `supabase/migrations/20251123000002_fix_school_flags_rls_recursion.sql`
4. Copy and paste the SQL content
5. Click **Run** to execute each migration

## Method 3: Using psql (PostgreSQL Client)

If you have direct database access:

```bash
psql -h [your-db-host] -U postgres -d postgres -f supabase/migrations/20251123000000_fix_staff_assignments_rls_recursion.sql
psql -h [your-db-host] -U postgres -d postgres -f supabase/migrations/20251123000001_fix_form_submissions_rls_recursion.sql
psql -h [your-db-host] -U postgres -d postgres -f supabase/migrations/20251123000002_fix_school_flags_rls_recursion.sql
```

## Verification

After applying the migrations, test:

1. **Coordinator Pages**: 
   - Login as a regional coordinator
   - Navigate to "District Coordinators" page
   - Should load without recursion errors

2. **Applications Page**:
   - Login as admin
   - Navigate to "Applications" page
   - Should load without recursion errors

3. **Check for Errors**:
   - Open browser console (F12)
   - Look for any "infinite recursion" errors
   - Should see no such errors

## What Changed

### Before (Recursive - BAD):
```sql
CREATE POLICY "Regional coordinators can view assignments in their region"
ON staff_assignments
USING (
  EXISTS (
    SELECT 1 FROM staff_assignments sa  -- ❌ Queries itself!
    WHERE sa.user_id = auth.uid()
  )
);
```

### After (Non-Recursive - GOOD):
```sql
CREATE POLICY "Coordinators can view coordinator assignments"
ON staff_assignments
USING (
  EXISTS (
    SELECT 1 FROM user_roles  -- ✅ Checks user_roles instead
    WHERE user_id = auth.uid()
    AND role IN ('regional_coordinator', 'district_coordinator')
  )
);
```

## Rollback (If Needed)

If you need to rollback, you can manually recreate the old policies, but this is not recommended as they cause recursion errors.

## Support

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify all migrations were applied successfully
3. Ensure your database user has proper permissions

