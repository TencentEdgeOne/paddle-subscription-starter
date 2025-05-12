"use client";

import { SubscriptionPlans } from "@/components/subscription-plans";

export default function PricingPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold sm:text-4xl mb-4">Subscription Plans</h1>
        <p className="max-w-2xl mx-auto text-gray-500">
          Choose the plan that works best for you. All plans come with a 30-day free trial.
        </p>
      </div>
      <SubscriptionPlans />
    </div>
  );
} 