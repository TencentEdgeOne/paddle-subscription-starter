"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { setToken } from "@/lib/auth";

interface AuthFormProps {
  type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailSent(false);

    try {
      const endpoint = type === "login" ? "/auth/login" : "/auth/register";
      const body = type === "login" 
        ? { email, password } 
        : { name, email, password };
      console.log("????", process.env);
      const response = await fetch(process.env.NEXT_PUBLIC_DEV ? `${process.env.NEXT_PUBLIC_API_URL_DEV}${endpoint}` : endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Handle email confirmation requirement
      if (data.requiresEmailConfirmation) {
        setEmailSent(true);
        return;
      }

      // Save authentication token to localStorage
      if (data.token) {
        setToken(data.token);
        
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError("No authentication token received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during authentication");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a confirmation email to {email}. Please check your inbox and follow the instructions to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <a href="/login">Back to login</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{type === "login" ? "Login" : "Register"}</CardTitle>
        <CardDescription>
          {type === "login" 
            ? "Login to your account to access subscription services" 
            : "Create an account to start using our services"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
            {type === "register" && (
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? "Please wait..." 
              : type === "login" ? "Login" : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-neutral-500">
          {type === "login" 
            ? "Don't have an account?" 
            : "Already have an account?"}
          <a 
            href={type === "login" ? "/register" : "/login"} 
            className="text-blue-600 hover:underline ml-1"
          >
            {type === "login" ? "Register" : "Login"}
          </a>
        </p>
      </CardFooter>
    </Card>
  );
} 