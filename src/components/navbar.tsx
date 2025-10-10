
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from 'next/headers';
import { LogoutButton } from './logout-button';

export const dynamic = 'force-dynamic';

async function checkSubscriptionStatus() {
  if(!process.env.NEXT_PUBLIC_API_URL) {
    console.error('NEXT_PUBLIC_API_URL is not defined');
    return false;
  }
  const cookieStore = await cookies();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`,
    {
      method: 'GET',
      credentials: 'include', // 确保发送 cookies
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString()
      },
    }
  );
  if (response.ok) {
    return true;
  }
  return false;
}

export async function Navbar() {
  let isLoggedIn = false;
  isLoggedIn = await checkSubscriptionStatus();
  
  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/"
              className="flex-shrink-0 flex items-center font-bold text-xl"
            >
              Paddle Subscription Starter
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </Link>
              {isLoggedIn && (
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isLoggedIn ? (
              <LogoutButton />
            ) : (
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  asChild
                >
                  <Link href="/login">
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                >
                  <Link href="/register">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}