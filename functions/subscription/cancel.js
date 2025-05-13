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
    
    // 获取与用户关联的客户ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', user.email)
      .single();
    
    if (customerError) {
      console.error('获取客户时出错:', customerError);
      return new Response(
        JSON.stringify({ success: false, message: '获取客户信息时出错' }),
        { status: 500, headers }
      );
    }
    
    if (!customer) {
      return new Response(
        JSON.stringify({ success: false, message: '未找到客户记录' }),
        { status: 404, headers }
      );
    }
    
    // 获取用户的活动订阅
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .in('subscription_status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (subscriptionError) {
      console.error('获取订阅时出错:', subscriptionError);
      return new Response(
        JSON.stringify({ success: false, message: '获取订阅信息时出错' }),
        { status: 500, headers }
      );
    }
    
    if (!subscription) {
      return new Response(
        JSON.stringify({ success: false, message: '未找到活动订阅' }),
        { status: 404, headers }
      );
    }
    

    try {
     
      const paddleResponse = await callPaddleApi(context, `/subscriptions/${subscription.subscription_id}/cancel`, 'PATCH');
      
      
      if (!paddleResponse.ok) {
        throw new Error('取消Paddle订阅失败');
      }
      
    
      return new Response(
        JSON.stringify({
          success: true,
          message: '订阅已成功取消'
        }),
        { status: 200, headers }
      );
    } catch (paddleError) {
      console.error('Paddle API错误:', paddleError);
      return new Response(
        JSON.stringify({ success: false, message: paddleError.message || '取消订阅时出错' }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('处理取消订阅请求时出错:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || '服务器错误' }),
      { status: 500, headers }
    );
  }
} 