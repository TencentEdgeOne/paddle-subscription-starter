import { createSupabaseClient } from '../../lib/supabase.js';
import { cookiesOption } from '../../lib/cookies.js';
export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Parse request body
    const reqBody = await context.request.body;
    const { email, password } = reqBody;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide email and password' }),
        { status: 400, headers }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient(context.env);

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

    // If email verification is not required,  login directly
    const cookieValue = `access_token=${data.session.access_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${cookiesOption.maxAge}; Path=/`;
      const responseHeaders = {
      ...headers,
      'Set-Cookie': cookieValue
    };
    if (data.user && !data.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Registration successful, please check your email to verify your account',
          requiresEmailVerification: true
        }),
        { status: 200, responseHeaders }
      );
    }

    // If email verification is required
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful',
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