import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md pt-12">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
      <AuthForm type="login" />
    </div>
  );
} 