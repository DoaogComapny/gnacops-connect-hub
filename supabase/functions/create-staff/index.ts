import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateStaffRequest {
  email: string;
  fullName: string;
  role: string;
  password: string;
  permissions?: string[];
  region?: string;
  district?: string;
  department?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => ['admin', 'super_admin'].includes(r.role));
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, fullName, role, password, permissions, region, district, department }: CreateStaffRequest = await req.json();

    // Validate inputs
    if (!email || !fullName || !role || !password) {
      throw new Error('Missing required fields');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if ((role === 'district_coordinator' && (!region || !district)) ||
        (role === 'regional_coordinator' && !region)) {
      throw new Error('Region and district required for coordinators');
    }

    // Check if email already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      throw new Error('A user with this email already exists in the system');
    }

    // Check if email exists in auth.users
    const { data: authUsers, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!authCheckError && authUsers?.users) {
      const emailExists = authUsers.users.some(user => user.email === email);
      if (emailExists) {
        throw new Error('A user with this email already exists in the system');
      }
    }

    // Create user account using admin API with provided password
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error('[create-staff] Auth error:', createError);
      
      // Provide user-friendly error messages
      if (createError.message?.includes('already been registered')) {
        throw new Error('A user with this email already exists in the system');
      }
      
      throw new Error(`Account creation failed: ${createError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    const userId = authData.user.id;
    console.log(`[create-staff] Created staff user: ${userId}`);

    // Assign role
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role: role,
    });

    if (roleError) {
      console.error('[create-staff] Role assignment error:', roleError);
      throw new Error('Failed to assign role');
    }

    // Create staff assignment if coordinator
    if (role === 'district_coordinator' || role === 'regional_coordinator') {
      const { error: assignmentError } = await supabaseAdmin
        .from('staff_assignments')
        .insert({
          user_id: userId,
          role: role,
          region: region,
          district: role === 'district_coordinator' ? district : null,
        });

      if (assignmentError) {
        console.error('[create-staff] Assignment error:', assignmentError);
        throw new Error('Failed to create staff assignment');
      }
    }

    // Create department assignment if provided
    if (department) {
      const { error: deptError } = await supabaseAdmin
        .from('department_staff_assignments')
        .insert({
          user_id: userId,
          department_code: department,
          role: role,
        });

      if (deptError) {
        console.error('[create-staff] Department assignment error:', deptError);
        throw new Error('Failed to assign department');
      }
    }

    // Assign permissions if provided
    if (permissions && permissions.length > 0) {
      // Note: Permission assignment would typically be done through role_permissions
      // This is a placeholder for future implementation
      console.log(`[create-staff] Permissions provided: ${permissions.length}`);
    }

    console.log(`[create-staff] Staff member created successfully: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Staff account created successfully. User can now login with their email and password.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[create-staff] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
