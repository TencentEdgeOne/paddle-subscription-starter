import { CheckoutOpenOptions} from "@paddle/paddle-js";

/**
 * Initializes Paddle on the client side
 * This function should be called after the page loads
 */
export const initPaddle = async (): Promise<void> => {
  // Only run on client side
  if (typeof window === "undefined") return;

  const script = document.createElement("script");
  script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
  script.async = true;

  script.onload = () => {
    // Initialize Paddle
    console.log(
      "process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    );
    window.Paddle?.Environment.set(
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
        ? "production"
        : "sandbox"
    );
    window.Paddle?.Initialize({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });
  };
  document.head.appendChild(script);
};

/**
 * Opens Paddle checkout with the provided price ID
 */
export const openCheckout = (priceId: string, email?: string): void => {
  if (typeof window === "undefined" || !window.Paddle) {
    console.error("Paddle is not initialized");
    return;
  }

  const checkoutOptions: CheckoutOpenOptions = {
    customer: {
      email: email as string,
    },
    items: [
      {
        priceId: priceId,
        quantity: 1,
      },
    ],
  };

  // Open checkout
  window.Paddle.Checkout.open(checkoutOptions);
};

/**
 * Fetch price information from our API
 */
export const getPrices = async () => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_DEV ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/paddle/prices` : `${process.env.NEXT_PUBLIC_API_URL}/paddle/prices`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Paddle prices:", error);
    return [];
  }
};
