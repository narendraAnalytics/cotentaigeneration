import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { Suspense } from "react";
import BackButton from "@/components/BackButton";

/**
 * Stack Auth Handler
 * Handles all authentication routes: /handler/sign-in, /handler/sign-up, etc.
 * This is a Server Component that renders Stack's built-in UI
 */
export default function Handler(props: any) {
  return (
    <div className="relative min-h-screen">
      {/* Back Button (Client Component) */}
      <BackButton />

      {/* Stack Auth UI */}
      <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center"><div>Loading...</div></div>}>
        <StackHandler fullPage app={stackServerApp} routeProps={props} />
      </Suspense>
    </div>
  );
} 
