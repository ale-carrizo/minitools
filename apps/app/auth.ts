import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { checkRateLimit } from "@/lib/rate-limit";

// Hash "de relleno" sin contraseña real detrás — se compara contra esto cuando
// el email no existe, para que authorize() tarde lo mismo que cuando sí existe
// y bcrypt.compare corre de verdad. Sin esto, "email no existe" responde mucho
// más rápido que "email existe, contraseña mal", lo que permite enumerar
// cuentas midiendo el tiempo de respuesta del login.
const DUMMY_HASH = "$2b$12$HEsLpwlKu033JSgfFxRDoO10TmOJBYfLyReVDVv46mITJmfSKxHJC";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const rate = checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
        if (!rate.allowed) return null;

        const email = String(credentials.email).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        const valid = await bcrypt.compare(
          credentials.password as string,
          user?.password ?? DUMMY_HASH
        );

        if (!user || !user.password) return null;
        if (user.suspended) return null;
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email?.trim().toLowerCase(),
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Block suspended users (Google OAuth)
      if (account?.provider === "google" && user.email) {
        const email = user.email.trim().toLowerCase();
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });
        if (dbUser?.suspended) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        // Fetch role from DB — OAuth providers don't return it
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";

        const now = new Date();
        await prisma.user.update({
          where: { id: user.id! },
          data: { lastLoginAt: now, lastActiveAt: now },
        });
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
});
