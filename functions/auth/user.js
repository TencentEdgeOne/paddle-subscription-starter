import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // 设置CORS头（开发模式）
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 只允许GET请求
  if (context.request.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, message: '方法不允许' }),
      { status: 405, headers }
    );
  }

  try {
    // 获取请求中的授权令牌
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: '未授权' }),
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // 初始化Supabase客户端
    const supabase = createSupabaseAdminClient(context);
    
    // 验证用户令牌并获取用户信息
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return new Response(
        JSON.stringify({ success: false, message: '无效的访问令牌' }),
        { status: 401, headers }
      );
    }
    
    // 返回用户信息（移除敏感字段）
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
    console.error('处理用户信息请求时出错:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || '服务器错误' }),
      { status: 500, headers }
    );
  }
} 