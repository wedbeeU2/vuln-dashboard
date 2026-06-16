import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export function getGoogleOAuthCredentials(env: NodeJS.ProcessEnv = process.env) {
  return {
    clientId: getRequiredEnv(env, "GOOGLE_CLIENT_ID"),
    clientSecret: getRequiredEnv(env, "GOOGLE_CLIENT_SECRET")
  };
}

function getRequiredEnv(env: NodeJS.ProcessEnv, key: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = env[key];

  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const googleOAuthCredentials = getGoogleOAuthCredentials();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider(googleOAuthCredentials)
  ],
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/"
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
};

export function getCurrentSession() {
  return getServerSession(authOptions);
}
