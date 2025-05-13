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

3. Create a `.env.local` file in the root directory with the following content:

```
DEV=true
VITE_API_URL_DEV=http://localhost:8088/
FRONT_END_URL_DEV=http://localhost:3000/
JWT_SECRET=your_jwt_secret_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Replace the Supabase values with your actual project credentials.

### Development

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

This project is licensed under the MIT License.
