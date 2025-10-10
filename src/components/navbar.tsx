
'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from './logout-button';

async function checkSubscriptionStatus() {
  try {
    const response = await fetch(`/api/auth/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (e) {
    console.error('Error checking subscription status:', e);
    return false;
  }
}

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    checkSubscriptionStatus()
      .then((ok) => {
        if (mounted) setIsLoggedIn(ok);
      })
      .catch(() => {
        if (mounted) setIsLoggedIn(false);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  
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
                prefetch={false}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                prefetch={false}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </Link>
              {isLoggedIn && (
                <Link
                  href="/dashboard"
                  prefetch={false}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center" suppressHydrationWarning>
            {!hasMounted ? null : (
              isLoading ? null : (
                isLoggedIn ? (
                  <LogoutButton />
                ) : (
                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      asChild
                    >
                      <Link href="/login" prefetch={false}>
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                    >
                      <Link href="/register" prefetch={false}>
                        Register
                      </Link>
                    </Button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}