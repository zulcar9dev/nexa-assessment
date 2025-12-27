import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = ["/login"];

// API routes that don't require authentication
const publicApiRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for public API routes
    if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check for NextAuth.js token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // Also check the legacy cookie for backward compatibility
    const legacyCookie = request.cookies.get("auth-session");
    const isAuthenticated = !!token || !!legacyCookie;

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

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api/auth (NextAuth routes)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
    ],
};
