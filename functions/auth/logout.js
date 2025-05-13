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
    // Get the authorization token from the request
    const authHeader = context.request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Initialize Supabase client
      const supabase = createSupabaseAdminClient(context);
      
      // Use Supabase to logout
      await supabase.auth.admin.signOut(token);
    }
    
    // Even if there's no token or logout fails, we still return success because the client has already cleared the local token
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Error processing logout request:', error);
    // Even if an error occurs, we still return success because the client has already cleared the local token
    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      { status: 200, headers }
    );
  }
} 