// pages/_middleware.js

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Clerk middleware configuration options can be passed here, but they don't include publicRoutes or ignoredRoutes directly.
});

// Example of handling specific routes
export const config = {
  // Define your routing patterns
  matcher: [
    "/((?!.*\\..*|_next).*)", // Matches all routes except those with dots (likely files) or _next folder
    "/", // Matches the root route
    "/(api|trpc)(.*)", // Matches routes starting with /api or /trpc
  ],
};
