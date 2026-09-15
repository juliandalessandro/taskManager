import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                identifier: { label: "Email or username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier as string },
                            { username: credentials.identifier as string }
                        ]
                    }
                });

                const isValidPassword = user && await bcrypt.compare(
                    credentials.password as string, 
                    user.password as string
                );

                if (!user || !isValidPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    username: user.username,
                };
            }
        })
    ],
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
    pages: {
        signIn: "/auth/signin",
    },
});