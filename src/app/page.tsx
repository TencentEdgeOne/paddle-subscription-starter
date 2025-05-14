import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Paddle Subscription Starter
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              This is a demo of Paddle Subscription Starter on EdgeOne Pages. It shows how to create a subscription page with Paddle, Supabase, and EdgeOne Pages.
            </p>
          </div>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/pricing">
                View Plans
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">
                Register Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
