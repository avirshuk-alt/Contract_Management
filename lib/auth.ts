import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  }
  interface Session {
    user: User & { role: UserRole };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { prisma } = await import("@/lib/db");
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });
        if (!user?.passwordHash) return null;

        const valid = await compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
});

// Role-based permission helpers
export const canCreateEditContract = (role: UserRole) =>
  ["Admin", "Legal", "Procurement"].includes(role);

export const canUploadDocument = (role: UserRole) =>
  ["Admin", "Legal", "Procurement"].includes(role);
