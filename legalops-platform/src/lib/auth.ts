import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        console.log("[AUTH] Attempting login for:", credentials.email);

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.passwordHash) {
          console.log("[AUTH] User not found or no password hash");
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.log("[AUTH] Invalid password");
          return null;
        }

        console.log("[AUTH] Login successful for:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Refresh user data on update trigger
      if (trigger === "update") {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (updatedUser) {
          token.role = updatedUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging
};

