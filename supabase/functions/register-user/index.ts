import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  formData: any;
  categoryId: string;
  categoryName: string;
}

const membershipCategories: Record<string, 'prime' | 'associate'> = {
  'Institutional Membership': 'prime',
  'Proprietor': 'prime',
  'Teacher Council': 'associate',
  'Parent Council': 'associate',
  'Service Provider': 'associate',
  'Non-Teaching Staff': 'associate',
};

const regionNumbers: Record<string, string> = {
  'Greater Accra': '01',
  'Ashanti': '02',
  'Western': '03',
  'Eastern': '04',
  'Central': '05',
  'Northern': '06',
  'Upper East': '07',
  'Upper West': '08',
  'Volta': '09',
  'Brong Ahafo': '10',
  'Bono East': '11',
  'Ahafo': '12',
  'Savannah': '13',
  'North East': '14',
  'Oti': '15',
  'Western North': '16',
};

function generateGnacopsId(
  categoryName: string,
  region: string,
  serialNumber: number
): string {
  const category = membershipCategories[categoryName];
  const categoryCode = category === 'prime' ? 'PM' : 'AM';
  const regionCode = regionNumbers[region] || '00';
  const paddedSerial = String(serialNumber).padStart(4, '0');
  return `GNC/${categoryCode}/${regionCode}/${paddedSerial}`;
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

    const {
      fullName,
      email,
      password,
      formData,
      categoryId,
      categoryName,
    }: RegistrationRequest = await req.json();

    console.log(`[register-user] Starting registration for ${email}, category: ${categoryName}`);

    // Validate inputs
    if (!fullName || !email || !password || !categoryId || !categoryName) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('[register-user] Auth error:', authError);
      throw new Error(`Account creation failed: ${authError.message}`);
    }
    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    const userId = authData.user.id;
    console.log(`[register-user] Created auth user: ${userId}`);

    // Get next serial number atomically
    const { data: serialData, error: serialError } = await supabaseAdmin.rpc(
      'next_membership_serial',
      { _category_id: categoryId }
    );

    if (serialError) {
      console.error('[register-user] Serial error:', serialError);
      throw new Error('Failed to generate serial number');
    }

    const serialNumber = serialData as number;
    console.log(`[register-user] Generated serial: ${serialNumber}`);

    // Generate GNACOPS ID
    const gnacopsId = generateGnacopsId(
      categoryName,
      formData.region || 'Greater Accra',
      serialNumber
    );
    console.log(`[register-user] Generated GNACOPS ID: ${gnacopsId}`);

    // Create profile (trigger should have created it, but we update it)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        email,
        phone: formData.phone || '',
        email_verified: true,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('[register-user] Profile error:', profileError);
      throw new Error('Profile creation failed');
    }

    // Create membership
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .insert({
        user_id: userId,
        category_id: categoryId,
        gnacops_id: gnacopsId,
        status: 'pending',
        payment_status: 'unpaid',
        region: formData.region || '',
      })
      .select()
      .single();

    if (membershipError) {
      console.error('[register-user] Membership error:', membershipError);
      throw new Error('Membership creation failed');
    }

    // Save form submission
    const { error: submissionError } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        membership_id: membership.id,
        submission_data: formData,
      });

    if (submissionError) {
      console.error('[register-user] Submission error:', submissionError);
      throw new Error('Form submission failed');
    }

    // Send welcome email
    try {
      const { error: emailError } = await supabaseAdmin.functions.invoke('send-welcome-email', {
        body: {
          email,
          fullName,
          gnacopsId,
          hasPassword: true,
        },
      });

      if (emailError) {
        console.error('[register-user] Email error:', emailError);
        // Don't throw - user is created, email failure is non-critical
      } else {
        console.log('[register-user] Welcome email sent successfully');
      }
    } catch (emailErr) {
      console.error('[register-user] Email exception:', emailErr);
    }

    console.log('[register-user] Registration completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        gnacopsId,
        message: 'Registration successful',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );

  } catch (error: any) {
    console.error('[register-user] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Registration failed',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
