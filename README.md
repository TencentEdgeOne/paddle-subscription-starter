# Subscription Demo App

This is a demonstration application showcasing login, registration, and subscription features using EdgeOne Pages.

## Features

- User authentication (login/register)
- Subscription plans with different pricing tiers
- Subscription management
- Protected dashboard for subscribed users

## Technology Stack

- **Frontend**: Next.js (Static Site Generation)
- **Components**: Custom components with shadcn/ui
- **Styling**: Tailwind CSS
- **Backend**: EdgeOne Functions for APIs
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/subscription-demo-app.git
cd subscription-demo-app
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
```

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

### Test User

You can use the following test user to log in:

- Email: user@example.com
- Password: password123

## Project Structure

- `/src` - Next.js frontend code
  - `/app` - Next.js app directory
  - `/components` - React components
  - `/lib` - Utility functions
- `/functions` - EdgeOne Functions for backend APIs
  - `/auth` - Authentication APIs (login, register)
  - `/subscription` - Subscription APIs (subscribe, status, cancel)

## Deployment

This application is designed to be deployed to EdgeOne Pages. Follow the EdgeOne documentation for deployment instructions.

## License

This project is licensed under the MIT License.
