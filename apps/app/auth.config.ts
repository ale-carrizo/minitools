import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Edge-compatible config: NO Prisma, NO bcrypt, NO Node.js-only modules
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  callbacks: {
    // Map JWT claims → session so middleware can read role
    session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as any)?.role === "ADMIN";
      const { pathname } = nextUrl;

      // Admin routes: must be logged in AND admin
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (!isAdmin) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      // Dashboard routes: must be logged in
      if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) return false;
        return true;
      }

      // Auth routes: redirect to dashboard if already logged in
      if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
