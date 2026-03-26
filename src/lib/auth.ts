import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { User as AppUser } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Dynamic imports to avoid edge runtime issues
        const bcrypt = await import("bcryptjs");
        const { findUserByUsername } = await import("@/lib/db");

        const username = credentials.username as string;
        const password = credentials.password as string;

        // Find user by username
        const user = await findUserByUsername(username);

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign in
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Dynamic imports
        const { findUserByEmail, createUser } = await import("@/lib/db");

        // Check if user already exists
        let existingUser = await findUserByEmail(email);

        if (!existingUser) {
          // Create new user from OAuth
          const newUser: AppUser = {
            id: crypto.randomUUID(),
            username: email.split("@")[0], // Use email prefix as username
            email: email,
            provider: "google",
            providerId: account.providerAccountId,
            name: user.name || undefined,
            image: user.image || undefined,
            createdAt: new Date().toISOString(),
          };
          existingUser = await createUser(newUser);
        }

        // Update user object with our internal ID
        user.id = existingUser.id;
      }

      return true;
    },
    async jwt({ token, user }) {
      // Add user ID to token on sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

