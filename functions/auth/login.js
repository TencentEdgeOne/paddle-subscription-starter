import { createSupabaseClient } from '../lib/supabase.js';

export function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.DEV === 'true') {
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

  return context.request.json()
    .then(async (data) => {
      const { email, password } = data;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email and password are required' }),
          { status: 400, headers }
        );
      }

      try {
        // Initialize Supabase client
        const supabase = createSupabaseClient(context);
        
        // Authenticate user with Supabase
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 401, headers }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Login successful',
            token: authData.session.access_token,
            user: {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.user_metadata?.full_name || email.split('@')[0]
            }
          }),
          { status: 200, headers }
        );
      } catch (error) {
        console.error('Login error:', error);
        return new Response(
          JSON.stringify({ success: false, message: error.message || 'Server error' }),
          { status: 500, headers }
        );
      }
    })
    .catch((error) => {
      console.error('Request processing error:', error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Server error' }),
        { status: 500, headers }
      );
    });
}