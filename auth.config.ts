import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.username = (user as any).username;
        }
        return token;
        },
        async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            (session.user as any).username = token.username;
        }
        return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;