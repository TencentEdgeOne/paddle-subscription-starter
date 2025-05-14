import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with admin privileges
 * This allows us to perform operations that require higher privileges, such as user management
 */
export function createSupabaseAdminClient(context) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Creates a Supabase client with normal privileges
 * Suitable for operations that do not require admin privileges
 */
export function createSupabaseClient(context) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseAnonKey = context.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 