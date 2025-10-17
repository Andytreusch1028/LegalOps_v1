import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    emailVerified?: Date | null;
  }
}

