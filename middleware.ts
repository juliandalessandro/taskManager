import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    
    const isLoggedIn = !!req.auth;
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/api/tasks");

    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("login", req.nextUrl.origin);
        return NextResponse.redirect(loginUrl);
    }
});

export const config = {
  matcher: ["/tasks/:path*"],
};