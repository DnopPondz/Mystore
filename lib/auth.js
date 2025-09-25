// lib/auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import { User } from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        await connectToDatabase();
        const user = await User.findOne({ email: creds?.email });
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds?.password), user.passwordHash || "");
        if (!ok) return null;
        if (user.banned) throw new Error("บัญชีนี้ถูกระงับการใช้งาน");
        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          banned: user.banned,
          loyaltyPoints: user.loyaltyPoints || 0,
          loyaltyTier: user.loyaltyTier || "starter",
          memberSince: user.memberSince ? user.memberSince.toISOString?.() || user.memberSince : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user";
        token.id = user.id;
        token.banned = !!user.banned;
        token.loyaltyPoints = user.loyaltyPoints || 0;
        token.loyaltyTier = user.loyaltyTier || "starter";
        token.memberSince = user.memberSince || null;
        return token;
      }

      if (!token?.id) return token;

      await connectToDatabase();
      const current = await User.findById(token.id).lean();
      if (!current) {
        token.banned = true;
        token.role = "user";
        return token;
      }
      token.role = current.role || "user";
      token.banned = !!current.banned;
      token.name = current.name || token.name;
      token.loyaltyPoints = current.loyaltyPoints || 0;
      token.loyaltyTier = current.loyaltyTier || "starter";
      token.memberSince = current.memberSince ? current.memberSince.toISOString?.() || current.memberSince : null;
      return token;
    },
    async session({ session, token }) {
      if (token?.banned) {
        return null;
      }
      session.user.role = token.role;
      session.user.id = token.id || token.sub;
      session.user.banned = !!token.banned;
      session.user.loyaltyPoints = token.loyaltyPoints || 0;
      session.user.loyaltyTier = token.loyaltyTier || "starter";
      session.user.memberSince = token.memberSince || null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
