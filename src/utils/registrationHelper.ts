import { supabase } from "@/integrations/supabase/client";
import { generateGnacopsId } from "@/lib/gnacopsId";

interface RegistrationData {
  fullName: string;
  email: string;
  formData: any;
  categoryId: string;
  categoryName: string;
}

// Generate a secure temporary password
export const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const registerUser = async ({
  fullName,
  email,
  formData,
  categoryId,
  categoryName,
}: RegistrationData) => {
  try {
    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const userId = authData.user.id;

    // Get the serial number for this membership type
    const { count } = await supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    const serialNumber = (count || 0) + 1;

    // Generate GNACOPS ID
    const gnacopsId = generateGnacopsId(
      categoryName as any,
      formData.region || 'Greater Accra',
      serialNumber
    );

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email,
        phone: formData.phone || '',
      });

    if (profileError) throw profileError;

    // Create membership
    const { data: membership, error: membershipError } = await supabase
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

    if (membershipError) throw membershipError;

    // Save form submission
    const { error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        membership_id: membership.id,
        submission_data: formData,
      });

    if (submissionError) throw submissionError;

    // Send welcome email with credentials
    const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        email,
        fullName,
        tempPassword,
        gnacopsId,
      },
    });

    if (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't throw error - user is created, just email failed
    }

    return {
      success: true,
      gnacopsId,
      tempPassword, // Return this for display in case email fails
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
