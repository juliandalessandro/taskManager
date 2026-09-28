import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/tasks");

    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        return NextResponse.redirect(loginUrl);
    }
});

export const config = {
    matcher: ["/tasks/:path*"],
};