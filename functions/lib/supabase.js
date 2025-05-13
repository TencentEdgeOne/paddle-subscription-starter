import { createClient } from '@supabase/supabase-js';

/**
 * 创建具有管理员权限的Supabase客户端
 * 这允许我们执行需要更高权限的操作，如用户管理
 */
export function createSupabaseAdminClient(context) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('缺少Supabase配置。请检查环境变量。');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * 创建具有普通权限的Supabase客户端
 * 适用于不需要管理员权限的操作
 */
export function createSupabaseClient(context) {
  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseAnonKey = context.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('缺少Supabase配置。请检查环境变量。');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 