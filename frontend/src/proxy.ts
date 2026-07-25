import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login"];

// API routes that don't require authentication
const publicApiRoutes = ["/api/auth"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip proxy for public API routes
    if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check for Better Auth session cookies
    const isAuthenticated = 
        request.cookies.has("better-auth.session_token") || 
        request.cookies.has("__Secure-better-auth.session_token");

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (isAuthenticated && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
    ],
};
