import { supabase } from "@/integrations/supabase/client";

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  formData: any;
  categoryId: string;
  categoryName: string;
}

export const registerUser = async ({
  fullName,
  email,
  password,
  formData,
  categoryId,
  categoryName,
}: RegistrationData) => {
  try {
    // Call server-side registration edge function
    const { data, error } = await supabase.functions.invoke('register-user', {
      body: {
        fullName,
        email,
        password,
        formData,
        categoryId,
        categoryName,
      },
    });

    if (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }

    if (!data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    return {
      success: true,
      gnacopsId: data.gnacopsId,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
};
