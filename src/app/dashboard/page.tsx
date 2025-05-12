"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  nextBillingDate: string;
  amount: string;
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch(
          process.env.DEV 
            ? `${process.env.VITE_API_URL_DEV}/subscription/status` 
            : "/subscription/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to get subscription information");
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error while getting subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        process.env.DEV 
          ? `${process.env.VITE_API_URL_DEV}/subscription/cancel` 
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
        throw new Error("Failed to cancel subscription");
      }

      // Refresh page to show updated subscription status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error while canceling subscription");
    } finally {
      setLoading(false);
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
                  <p className="text-lg font-semibold">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg font-semibold">
                    {subscription.status === "active" ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Canceled</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                  <p className="text-lg font-semibold">{subscription.nextBillingDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-lg font-semibold">{subscription.amount}</p>
                </div>
              </div>
              {subscription.status === "active" && (
                <Button 
                  variant="destructive" 
                  className="mt-4" 
                  onClick={handleCancelSubscription}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Cancel Subscription"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl mb-4">You don't have any active subscriptions</p>
          <Button asChild>
            <a href="/pricing">View Subscription Plans</a>
          </Button>
        </div>
      )}
    </div>
  );
} 