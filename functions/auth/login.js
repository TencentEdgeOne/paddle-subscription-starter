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
    // 解析请求体
    const reqBody = await context.request.json();
    const { email, password } = reqBody;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: '请提供电子邮件和密码' }),
        { status: 400, headers }
      );
    }

    // 初始化Supabase客户端
    const supabase = createSupabaseAdminClient(context);

    // 使用Supabase登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('登录失败:', error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || '登录失败' }),
        { status: 401, headers }
      );
    }

    // 成功登录，返回令牌和用户数据
    return new Response(
      JSON.stringify({
        success: true,
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
        }
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('处理登录请求时出错:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || '服务器错误' }),
      { status: 500, headers }
    );
  }
}