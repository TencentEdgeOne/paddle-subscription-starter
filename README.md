# Paddle Subscription Demo

This is a demonstration application showcasing login, registration, and subscription features using EdgeOne Pages and Supabase authentication.

## Features

- User authentication (login/register) via Supabase
- Email verification flow
- Subscription plans with different pricing tiers
- Subscription management
- Protected dashboard for subscribed users

## Technology Stack

- **Frontend**: Next.js (Static Site Generation)
- **Components**: Custom components with shadcn/ui
- **Styling**: Tailwind CSS
- **Backend**: EdgeOne Functions for APIs
- **Authentication**: Supabase Authentication
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to Authentication > Settings and:
   - Configure Email authentication provider
   - Enable "Confirm email" feature if desired
3. Get your Supabase URL and API keys from Project Settings > API

### Paddle Setup
#### Paddle Setup

1. Create a new Paddle account at [https://paddle.com](https://paddle.com)
2. In your Paddle control panel, find your product and create a new product
3. Get your Paddle API key

#### Paddle Product Setup

1. In your Paddle control panel, find your product and click "Edit"
2. In the "Prices" tab, set your product's price and subscription plan
3. In the "Webhook" tab, set your Webhook URL to `https://yourdomain.com/api/paddle/webhook`

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/paddle-subscription-demo.git
cd paddle-subscription-demo
```

2. Install dependencies:

```bash
npm install
```

### Development

#### Environment Variables
```
# Add the following environment variables for handling cross-origin issues during local debugging
NEXT_PUBLIC_DEV=true
NEXT_PUBLIC_API_URL_DEV=http://localhost:8088/
FRONT_END_URL_DEV=http://localhost:3000/

# Supabase Configuration
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxx

# Paddle Configuration
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
PADDLE_API_KEY=pdl_sdbx_apikey_xxxxxx
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxxxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxx
```

Acquisition Methods:
| Variable | Purpose | Acquisition Method |
| --- | --- | --- |
| SUPABASE_URL | Supabase request URL | Obtained from Supabase Dashboard > Project Settings > Data API tab |
| SUPABASE_ANON_KEY | Public key used for initiating Supabase requests | Obtained from Supabase Dashboard > Project Settings > Data API tab |
| SUPABASE_SERVICE_ROLE_KEY | Key used for initiating non-public Supabase requests | Obtained from Supabase Dashboard > Project Settings > Data API tab |
| NEXT_PUBLIC_PADDLE_ENVIRONMENT | Paddle project environment | 'production' or 'sandbox' |
| PADDLE_API_KEY | API Key for interactions between functions and Paddle | Created under [Paddle > Developer tools > Authentication](https://sandbox-vendors.paddle.com/authentication-v2) |
| NEXT_PUBLIC_PADDLE_CLIENT_TOKEN | Key used by the client for interactions with Paddle | Created under [Paddle > Developer tools > Authentication](https://sandbox-vendors.paddle.com/authentication-v2) |
| PADDLE_WEBHOOK_SECRET | Key for identifying the source of Webhook requests, ensuring security | Created under [Paddle > Developer tools > Notifications](https://sandbox-vendors.paddle.com/notifications) |

#### Local Development

1. Start the Next.js development server:

```bash
npm run dev
```

2. In a separate terminal, start the EdgeOne Functions development server:

```bash
npm run functions:dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src` - Next.js frontend code
  - `/app` - Next.js app directory
  - `/components` - React components
  - `/lib` - Utility functions
- `/functions` - EdgeOne Functions for backend APIs
  - `/auth` - Authentication APIs integrated with Supabase
  - `/subscription` - Subscription APIs (subscribe, status, cancel)
  - `/lib` - Shared utilities for EdgeOne Functions

## Database Design

In a production environment, you would extend the Supabase database with:

- `subscriptions` table - Store subscription information
- `plans` table - Store plan details

## Deployment

This application is designed to be deployed to EdgeOne Pages. Follow the EdgeOne documentation for deployment instructions.

Make sure to add all environment variables in your EdgeOne Pages dashboard.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
