import { createSupabaseClient } from '../../lib/supabase.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Get the authorization token from the request
    const accessToken = context.request.cookies['access_token'] || context.request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers }
      );
    }
    
    // Initialize Supabase client
    const supabase = createSupabaseClient(context.env);
    
    // Verify user token and get user information
    const { data, error } = await supabase.auth.getUser(accessToken);
    
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