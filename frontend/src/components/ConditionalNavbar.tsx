"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

/**
 * Conditional Navbar Component
 * Only shows navbar on non-auth pages
 */
export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on auth pages (/handler/sign-in, /handler/sign-up, etc.)
  const isAuthPage = pathname?.startsWith('/handler');

  // Don't render navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  return <Navbar />;
}
