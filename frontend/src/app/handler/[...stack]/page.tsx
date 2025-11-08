import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { Suspense } from "react";

/**
 * Stack Auth Handler
 * Handles all authentication routes: /handler/sign-in, /handler/sign-up, etc.
 * This is a Server Component that renders Stack's built-in UI
 */
export default function Handler(props: any) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </Suspense>
  );
} 
