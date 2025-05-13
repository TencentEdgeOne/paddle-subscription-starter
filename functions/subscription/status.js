import { createSupabaseClient } from '../lib/supabase.js';

// Mock subscription database from subscribe.js
// In a real app, this would be a database query
const subscriptions = [];

export function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.DEV === 'true') {
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

  // Verify authentication
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      { status: 401, headers }
    );
  }

  const token = authHeader.split(' ')[1];

  return (async () => {
    try {
      // Initialize Supabase client
      const supabase = createSupabaseClient(context);
      
      // Verify the user's token
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !userData.user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid token or user not found' }),
          { status: 401, headers }
        );
      }

      const userId = userData.user.id;
      
      // Get the user's most recent subscription
      const subscription = subscriptions
        .filter(sub => sub.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return new Response(
        JSON.stringify({
          success: true,
          subscription: subscription || null,
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('Subscription status error:', error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Server error' }),
        { status: 500, headers }
      );
    }
  })().catch(error => {
    console.error('Request processing error:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  });
} 