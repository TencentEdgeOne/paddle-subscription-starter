/**
 * Paddle global object type definition
 */
interface Paddle {
  Checkout: {
    open: (options: PaddleCheckoutOptions) => void;
  };
  Environment: {
    set: (environment: 'production' | 'sandbox') => void;
  };
  Initialize: (options: {
    token: string;
  }) => void;
}

/**
 * Extend Window interface, add Paddle property
 */
declare global {
  interface Window {
    Paddle?: Paddle;
  }
}

/**
 * Paddle checkout options type definition
 */
export interface PaddleCheckoutOptions {
  // Settings object
  settings?: {
    displayMode?: 'overlay' | 'inline'; // Display mode
    theme?: 'light' | 'dark'; // Theme
    locale?: string; // Language
    frameInitialHeight?: string; // iframe initial height
    frameStyle?: string; // iframe style
    frameTarget?: string; // iframe target container
    variant?: 'multi-page' | 'one-page'; // Checkout experience variant
    allowLogout?: boolean; // Whether to allow changing email
    allowDiscountRemoval?: boolean; // Whether to allow removing discounts
    showAddDiscounts?: boolean; // Whether to show add discount option
    showAddTaxId?: boolean; // Whether to show add tax ID option
    successUrl?: string; // Success redirect URL
  };
  // Customer information
  customer?: {
    id?: string; // Paddle customer ID
    email?: string; // Customer email
  };
  // Address information
  address?: {
    countryCode?: string; // Country code
    postalCode?: string; // Postal code
    region?: string; // Region/state/province
    city?: string; // City
    lineOne?: string; // Address line 1
    lineTwo?: string; // Address line 2
  };
  // Business information
  business?: {
    name?: string; // Business name
    taxIdentifier?: string; // Tax ID
  };
  // Items list
  items?: Array<{
    priceId: string; // Price ID
    quantity: number; // Quantity
  }>;
  // Transaction ID (choose either this or items)
  transactionId?: string;
  // Discount code or ID
  discountCode?: string;
  discountId?: string;
  // Custom data
  customData?: Record<string, unknown>;
  // Saved payment method ID
  savedPaymentMethodId?: string;
  // Customer authentication token
  customerAuthToken?: string;
}

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
    // console.log(
    //   "process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
    //   process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    // );
    window.Paddle?.Environment.set(
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
        ? "production"
        : "sandbox"
    );
    console.log(
      "process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      "process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT",
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
      window.Paddle
    );
    window.Paddle?.Initialize({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });
  };
  document.head.appendChild(script);
};

/**
 * Open Paddle checkout
 * @param options - Checkout options or price ID
 * @param email - Customer email (used when options is a string)
 */
export const openCheckout = (
  options: PaddleCheckoutOptions | string,
  email?: string
): void => {
  if (typeof window === 'undefined' || !window.Paddle) {
    console.error('Paddle not initialized');
    return;
  }
  
  let checkoutOptions: PaddleCheckoutOptions;
  
  // Compatible with old API call style
  if (typeof options === 'string') {
    checkoutOptions = {
      items: [
        {
          priceId: options,
          quantity: 1
        }
      ]
    };
    
    if (email) {
      checkoutOptions.customer = { email };
    }
  } else {
    checkoutOptions = options;
  }
  
  // Set defaults
  if (!checkoutOptions.settings) {
    checkoutOptions.settings = {
      displayMode: 'overlay',
      theme: 'light'
    };
  }
  
  // Open checkout
  window.Paddle?.Checkout.open(checkoutOptions);
};

/**
 * Fetch price information from our API
 */
export const getPrices = async () => {
  try {
    const response = await fetch(`/api/paddle/prices`);
    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Paddle prices:", error);
    return [];
  }
};

