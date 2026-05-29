import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16: proxy.ts replaces middleware.ts
// Uses ONLY edge-compatible config (no Prisma, no pg, no bcrypt)
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
