"use server"
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { User, userOAuth } from "@/app/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mail: { label: "E-mail", type: "string" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          await connectDB();
          const user = await User.findOne({ mail: credentials.mail }).select('mail isAdmin isActive password');
          await disconnectDB();

          if (user) {
            if (!user.isActive){
              return null;
            }
            const passwordMatch = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (passwordMatch) {
              return {
                email: user.mail,
                isAdmin: user.isAdmin,
                provider: "credentials",
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.isAdmin = user.isAdmin || false;
        token.provider = user.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      session.user.isAdmin = token.isAdmin;
      session.user.provider = token.provider;
      return session;
    },
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectDB();
        let existingUser = await userOAuth.findOne({ mail: user.email });
        if (!existingUser) {
          existingUser = new userOAuth({
            mail: user.email,
            translatedText: [],
          });
          await existingUser.save();
        }
        await disconnectDB();
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});

export { handler as GET, handler as POST };
