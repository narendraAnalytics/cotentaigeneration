"use client";

import { stackClientApp } from "@/stack/client";

/**
 * Auth Utility Functions
 * Helper functions for authentication throughout the app
 */

// Check if user is currently logged in
export function useAuth() {
  const user = stackClientApp.useUser();
  return {
    user,
    isLoading: false,
    isAuthenticated: !!user,
  };
}

// Get current user
export function useUser() {
  return stackClientApp.useUser();
}

// Sign out function
export async function signOut() {
  await stackClientApp.signOut();
}

// Get user display name
export function getUserDisplayName(user: any) {
  return user?.displayName || user?.primaryEmail || "User";
}

// Get user initials for avatar
export function getUserInitials(user: any) {
  const name = getUserDisplayName(user);
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
