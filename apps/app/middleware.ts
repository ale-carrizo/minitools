import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Middleware uses ONLY the edge-compatible config (no Prisma, no pg, no bcrypt)
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
