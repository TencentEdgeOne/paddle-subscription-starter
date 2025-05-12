"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$49",
    interval: "per month",
    description: "Basic features for individual users",
    features: ["Basic access", "5GB storage per month", "Standard support", "1 user"],
  },
  {
    id: "pro",
    name: "Professional",
    price: "$99",
    interval: "per month",
    description: "Enhanced features for small teams",
    features: ["All Basic features", "25GB storage per month", "Priority support", "5 users"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    interval: "per month",
    description: "Complete suite for large organizations",
    features: ["All Pro features", "100GB storage per month", "24/7 dedicated support", "Unlimited users"],
  },
];

export function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);
  
  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const response = await fetch(process.env.DEV ? `${process.env.VITE_API_URL_DEV}/subscription/subscribe` : "/subscription/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Subscription failed");
      }
      
      // Redirect to payment page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // If no payment page needed, show success directly
        alert("Subscription successful!");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error during subscription process");
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-3 my-10">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`flex flex-col ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}
        >
          <CardHeader>
            {plan.popular && (
              <div className="py-1 px-3 bg-blue-500 text-white text-xs rounded-full w-fit mb-2">
                Most Popular
              </div>
            )}
            <CardTitle>{plan.name}</CardTitle>
            <div className="flex items-baseline mt-2">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="ml-1 text-neutral-500">{plan.interval}</span>
            </div>
            <CardDescription className="mt-2">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 shrink-0 mr-2"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? "Processing..." : "Subscribe"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}