import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };


  // Handle preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    // Parse request body
    const reqBody = await context.request.json();
    const { email, password } = reqBody;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide email and password' }),
        { status: 400, headers }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseAdminClient(context);

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

    // If email verification is required
    if (data.user && !data.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Registration successful, please check your email to verify your account',
          requiresEmailVerification: true
        }),
        { status: 200, headers }
      );
    }

    // If email verification is not required, login directly
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful',
        token: data.session?.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
        }
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error processing registration request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
} 