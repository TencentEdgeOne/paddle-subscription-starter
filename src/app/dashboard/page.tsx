"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Subscription } from "@/lib/supabase";

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if(!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined');
        }
        // Get subscription information from edge function API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status`,
          {
            method: 'GET',
            credentials: 'include', // 确保发送 cookies
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // Access token invalid or expired, redirect to login page
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to get subscription information");
        }

        const data = await response.json();
        console.log('subscription data', data)
        setSubscription(data.subscription);
      } catch (err) {
        console.error('Error getting subscription:', err);
        setError(err instanceof Error ? err.message : "Error getting subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleManageSubscription = async () => {
    // In actual implementation, this would redirect to Paddle's customer portal
    // or your own subscription management page
    alert("This would redirect to the subscription management portal in the actual implementation.");
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) return;

    try {
      setCancelLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/cancel`,
        {
          method: "POST",
          credentials: 'include', // 确保发送 cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // Reload the page to show updated subscription status
      window.location.reload();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err instanceof Error ? err.message : "Error canceling subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan</p>
                  <p className="text-lg font-semibold">{subscription.price_id || 'Standard Plan'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg font-semibold">
                    {subscription.subscription_status === "active" ? (
                      <span className="text-green-600">Active</span>
                    ) : subscription.subscription_status === "trialing" ? (
                      <span className="text-blue-600">Trial</span>
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
                  Manage Subscription
                </Button>
                
                {subscription.subscription_status === 'active' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="ml-4" 
                      onClick={() => window.open('https://support.paddle.com', '_blank')}
                    >
                      Contact Support
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="ml-4" 
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "Processing..." : "Cancel Subscription"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl mb-4">You don&apos;t have any active subscriptions</p>
          <Button asChild>
            <a href="/pricing">View Subscription Plans</a>
          </Button>
        </div>
      )}
    </div>
  );
}