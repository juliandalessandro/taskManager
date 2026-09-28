import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
                { email: credentials.identifier as string },
                { username: credentials.identifier as string },
            ],
          },
        });

        const isValidPassword = user && await bcrypt.compare(
            credentials.password as string,
            user.password as string
        );

        if (!user || !isValidPassword) {
            return null;
        }

        return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
        };
      },
    }),
  ],
});