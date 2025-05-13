import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

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
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error processing login request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
}