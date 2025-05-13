"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Subscription } from "@/lib/supabase";
import { getToken, clearToken } from "@/lib/auth";

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // 获取本地存储的token
        const token = getToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        // 从边缘函数API获取订阅信息
        const response = await fetch(
          process.env.NEXT_PUBLIC_DEV 
            ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/subscription/status` 
            : "/subscription/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // 访问令牌无效或过期，重定向到登录页面
            clearToken();
            window.location.href = "/login";
            return;
          }
          throw new Error("获取订阅信息失败");
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        console.error('获取订阅时出错:', err);
        setError(err instanceof Error ? err.message : "获取订阅信息时出错");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleManageSubscription = async () => {
    // 在实际实现中，这会重定向到Paddle的客户门户
    // 或你自己的订阅管理页面
    alert("这在实际实现中会重定向到订阅管理门户。");
  };

  const handleCancelSubscription = async () => {
    if (!confirm("您确定要取消订阅吗？此操作无法撤销。")) return;

    try {
      setCancelLoading(true);
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        process.env.NEXT_PUBLIC_DEV 
          ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/subscription/cancel` 
          : "/subscription/cancel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("取消订阅失败");
      }

      // 重新加载页面以显示更新后的订阅状态
      window.location.reload();
    } catch (err) {
      console.error('取消订阅时出错:', err);
      setError(err instanceof Error ? err.message : "取消订阅时出错");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8">我的仪表板</h1>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>当前订阅</CardTitle>
            <CardDescription>您的订阅详情</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">套餐</p>
                  <p className="text-lg font-semibold">{subscription.price_id || '标准套餐'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">状态</p>
                  <p className="text-lg font-semibold">
                    {subscription.subscription_status === "active" ? (
                      <span className="text-green-600">活跃</span>
                    ) : subscription.subscription_status === "trialing" ? (
                      <span className="text-blue-600">试用</span>
                    ) : (
                      <span className="text-red-600">{subscription.subscription_status}</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  管理订阅
                </Button>
                
                {subscription.subscription_status === 'active' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="ml-4" 
                      onClick={() => window.open('https://support.paddle.com', '_blank')}
                    >
                      联系支持
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="ml-4" 
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "处理中..." : "取消订阅"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl mb-4">您没有任何活跃的订阅</p>
          <Button asChild>
            <a href="/pricing">查看订阅计划</a>
          </Button>
        </div>
      )}
    </div>
  );
} 