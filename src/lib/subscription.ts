import { getToken } from "./auth";

/**
 * Check if a user has an active subscription
 * @returns Promise<boolean> True if user has an active subscription
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  try {
    // Get authentication token
    const token = getToken();
    if (!token) {
      return false;
    }

    // Call the subscription status API
    const response = await fetch(
      `/api/subscription/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Handle API response
    if (!response.ok) {
      console.error("Failed to check subscription status:", response.status);
      return false;
    }

    // Parse response data
    const data = await response.json();
    // Check if user has an active subscription
    const subscription = data.subscription;
    if (!subscription) {
      return false;
    }
    
    // Return true if subscription status is active or trialing
    return ["active", "trialing"].includes(subscription.subscription_status);
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
} 