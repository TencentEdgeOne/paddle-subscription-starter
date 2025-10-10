'use client';

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      if(!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined');
      }
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: 'include', // Ensure cookies are sent
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      window.location.href = "/";
    } catch (error) {
      console.error('Logout failed:', error);
      // Redirect to the homepage even if an error occurs
      window.location.href = "/";
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}