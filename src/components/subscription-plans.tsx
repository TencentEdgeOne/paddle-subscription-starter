"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initPaddle, openCheckout } from "@/lib/paddle";
import { getToken, getCurrentUser } from "@/lib/auth";

interface PlanPrice {
  id: string;
  product_id: string;
  name: string;
  description: string;
  features: string[];
  unit_price: {
    amount: string;
    currency_code: string;
  };
  billing_cycle: {
    interval: string;
    frequency: number;
  };
}

export function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  
  // Initialize Paddle when component mounts
  useEffect(() => {
    initPaddle();
    
    // Get user email from API
    
    
    // Fetch prices from our API
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_DEV}/paddle/prices`);
        if (!response.ok) {
          throw new Error("Failed to fetch subscription plans");
        }
        
        const data = await response.json();
        if (data.success && data.prices) {
          setPrices(data.prices);
        }
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };
    
    fetchPrices();
  }, []);
  
  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    
    try {
      // Check if user is logged in
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const user = await getCurrentUser();
      if (user?.email) {
        // Open Paddle checkout
        openCheckout(priceId, user.email || undefined);
      }
    
      
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setLoading(null);
    }
  };
  
  if (prices.length === 0) {
    return <div className="text-center py-8">Loading subscription plans...</div>;
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-3 my-10">
      {prices.map((plan) => {
        const amount = parseInt(plan.unit_price.amount) / 100;
        const currency = plan.unit_price.currency_code;
        const isPopular = plan.name.includes("Professional");
        
        return (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${isPopular ? "border-blue-500 shadow-lg" : ""}`}
          >
            <CardHeader>
              {isPopular && (
                <div className="py-1 px-3 bg-blue-500 text-white text-xs rounded-full w-fit mb-2">
                  Most Popular
                </div>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : ''}
                  {amount}
                </span>
                <span className="ml-1 text-neutral-500">per {plan.billing_cycle.interval}</span>
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {/* In a real app, you would fetch features from the API */}
                {plan.features?.map((feature, index) => (
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
                variant={isPopular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? "Processing..." : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}