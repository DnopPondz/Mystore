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
        return { id: String(user._id), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role || "user";
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
