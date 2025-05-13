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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: '未授权' }),
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // 解析请求体
    const reqBody = await context.request.json();
    const { priceId } = reqBody;

    if (!priceId) {
      return new Response(
        JSON.stringify({ success: false, message: '价格ID是必需的' }),
        { status: 400, headers }
      );
    }
    
    // 初始化Supabase客户端
    const supabase = createSupabaseAdminClient(context);
    
    // 验证用户令牌并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: '无效的访问令牌' }),
        { status: 401, headers }
      );
    }
    
    // 检查用户是否已经有一个活跃的订阅
    // 1. 先查找用户关联的客户ID
    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .single();
    
    if (customer) {
      // 如果找到客户记录，检查是否有活跃订阅
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customer.customer_id)
        .in('subscription_status', ['active', 'trialing'])
        .maybeSingle();
      
      if (subscription) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: '您已经有一个活跃的订阅',
            subscription
          }),
          { status: 409, headers }
        );
      }
    }
    
    // 在此处，我们通常会调用Paddle API创建订阅
    // 但在本示例中，我们将从前端直接调用Paddle结账
    // 然后通过webhook更新数据库
    
    // 返回成功响应，指导前端如何处理
    return new Response(
      JSON.stringify({
        success: true,
        message: '准备创建订阅',
        action: 'redirect_to_checkout',
        priceId,
        userId: user.id,
        userEmail: user.email
      }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('处理订阅请求时出错:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || '服务器错误' }),
      { status: 500, headers }
    );
  }
} 