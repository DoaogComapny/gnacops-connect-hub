# 🚀 Quick Apply - One-Click Migration

## Apply All Fixes in One Step!

I've created a **single combined migration file** that fixes all RLS recursion issues at once.

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (ID: `zrxvgamrqodzhidelmzx`)
3. Click **SQL Editor** in the left sidebar

### Step 2: Apply the Migration
1. Click **New Query**
2. Open the file: `supabase/migrations/APPLY_ALL_RLS_FIXES.sql`
3. **Copy the ENTIRE file content** (Ctrl+A, Ctrl+C)
4. **Paste into SQL Editor** (Ctrl+V)
5. Click **Run** button (or press Ctrl+Enter)
6. Wait for "Success" message ✅

### Step 3: Verify It Worked
After the migration completes:

1. **Test Coordinator Pages:**
   - Login as regional coordinator
   - Go to "District Coordinators" page
   - Should load without errors ✅

2. **Test Applications Page:**
   - Login as admin
   - Go to "Applications" page  
   - Should load without errors ✅

3. **Check Console:**
   - Press F12 (Developer Tools)
   - Look for "infinite recursion" errors
   - Should see NONE ✅

## What This Fixes

✅ Infinite recursion in `staff_assignments`  
✅ Infinite recursion in `form_submissions`  
✅ Infinite recursion in `school_flags`  
✅ Coordinator fetching issues  
✅ Applications page loading issues  

## File Location

The combined migration file is here:
```
supabase/migrations/APPLY_ALL_RLS_FIXES.sql
```

Just copy the entire file and paste it into Supabase SQL Editor!

---

**Note:** This migration is safe to run multiple times. It uses `DROP POLICY IF EXISTS` and `CREATE OR REPLACE FUNCTION`, so it won't break if you run it again.

