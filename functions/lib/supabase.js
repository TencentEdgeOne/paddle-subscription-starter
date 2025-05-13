import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the provided context's environment variables
 * @param {object} context - EdgeOne function context containing environment variables
 * @returns {object} Supabase client instance
 */
export function createSupabaseClient(context) {
  console.log(context.env);
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseAnonKey = context.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a Supabase admin client with the service role key
 * @param {object} context - EdgeOne function context containing environment variables
 * @returns {object} Supabase admin client instance
 */
export function createSupabaseAdminClient(context) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseServiceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin configuration. Please check your environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey);
} 