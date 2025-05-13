import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  // Handle preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow GET requests
  if (context.request.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    // Get the authorization token from the request
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Initialize Supabase client
    const supabase = createSupabaseAdminClient(context);
    
    // Verify user token and get user information
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid access token' }),
        { status: 401, headers }
      );
    }
    
    // Return user information (remove sensitive fields)
    const safeUserData = {
      id: data.user.id,
      email: data.user.email,
      email_confirmed_at: data.user.email_confirmed_at,
      last_sign_in_at: data.user.last_sign_in_at
    };
    
    return new Response(
      JSON.stringify({ success: true, user: safeUserData }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Error processing user information request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
} 