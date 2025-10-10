import { createSupabaseClient } from '../../lib/supabase.js';
import { cookiesOption } from '../../lib/cookies.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Parse request body
    const reqBody = context.request.body;
    const { email, password } = reqBody;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide email and password' }),
        { status: 400, headers }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient(context.env);

    // Use Supabase to login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login failed:', error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Login failed' }),
        { status: 401, headers }
      );
    }

    const cookieValue = `access_token=${data.session.access_token}; HttpOnly; Secure; SameSite=${cookiesOption.sameSite}; Max-Age=${cookiesOption.maxAge}; Path=/`;
    
    const responseHeaders = {
      ...headers,
      'Set-Cookie': cookieValue
    };

    // Successfully logged in, return token and user data
    return new Response(
      JSON.stringify({
        success: true,
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
        }
      }),
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('Error processing login request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
}