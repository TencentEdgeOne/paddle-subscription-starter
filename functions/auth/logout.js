import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // 设置CORS头（开发模式）
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 只允许POST请求
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: '方法不允许' }),
      { status: 405, headers }
    );
  }

  try {
    // 获取请求中的授权令牌
    const authHeader = context.request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // 初始化Supabase客户端
      const supabase = createSupabaseAdminClient(context);
      
      // 使用Supabase登出
      await supabase.auth.admin.signOut(token);
    }
    
    // 即使没有token或登出失败，我们仍然返回成功，因为客户端已经清除了本地token
    return new Response(
      JSON.stringify({
        success: true,
        message: '登出成功'
      }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('处理登出请求时出错:', error);
    // 即使出错，我们仍然返回成功，因为客户端已经清除了本地token
    return new Response(
      JSON.stringify({ success: true, message: '登出成功' }),
      { status: 200, headers }
    );
  }
} 