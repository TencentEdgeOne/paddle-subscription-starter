/**
 * Initializes Paddle on the client side
 * This function should be called after the page loads
 */
export const initPaddle = (): void => {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  // Check if window.Paddle is already defined
  if ((window as any).Paddle) return;
  
  // Load Paddle.js script
  const script = document.createElement('script');
  script.src =
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
      ? "https://cdn.paddle.com/paddle/v2/paddle.js"
      : "https://cdn.paddle.com/paddle/v2/paddle.js";
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    // Initialize Paddle
    console
      .log(
        "process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
        process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
      );
      (window as any).Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      });
  };
  
  document.head.appendChild(script);
};

/**
 * Opens Paddle checkout with the provided price ID
 */
export const openCheckout = (priceId: string, email?: string): void => {
  if (typeof window === 'undefined' || !(window as any).Paddle) {
    console.error('Paddle is not initialized');
    return;
  }
  
  const checkoutOptions: Record<string, any> = {
    customer: {
      email: email
    },
    items: [
      {
        priceId: priceId,
        quantity: 1
      }
    ]
  };

  
  // Open checkout
  (window as any).Paddle.Checkout.open(checkoutOptions);
};

/**
 * Fetch price information from our API
 */
export const getPrices = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_DEV}/paddle/prices`);
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Paddle prices:', error);
    return [];
  }
}; 