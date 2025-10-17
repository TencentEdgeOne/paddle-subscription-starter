import { createSupabaseClient } from '../../lib/supabase.js';
export async function POST(request) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Parse request body
    const reqBody = await request.json();
    const { email, password } = reqBody;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide email and password' }),
        { status: 400, headers }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Use Supabase to register
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Registration failed:', error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Registration failed' }),
        { status: 400, headers }
      );
    }

    // Check if user was created successfully
    if (data.user) {
      // Always require email verification - do not set login cookie
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Registration successful! Please check your email to verify your account before logging in.',
          requiresEmailVerification: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            email_confirmed_at: data.user.email_confirmed_at,
          }
        }),
        { status: 200, headers }
      );
    }

    // Fallback response if no user data
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Registration failed - no user data returned'
      }),
      { status: 400, headers }
    );
  } catch (error) {
    console.error('Error processing registration request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
}