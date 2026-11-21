import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Couple from "@/models/Couple";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Couple Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          throw new Error("Invalid email or password format");
        }

        await connectToDatabase();

        const couple = await Couple.findOne({
          email: validated.data.email.toLowerCase().trim(),
        });

        if (!couple) {
          throw new Error("No couple account found with this email");
        }

        const isValidPassword = await bcrypt.compare(
          validated.data.password,
          couple.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Incorrect password");
        }

        return {
          id: couple._id.toString(),
          email: couple.email,
          name: `${couple.partnerOneName} & ${couple.partnerTwoName}`,
          weddingCode: couple.weddingCode,
          profileSlug: couple.profileSlug,
          partnerOneName: couple.partnerOneName,
          partnerTwoName: couple.partnerTwoName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.weddingCode = user.weddingCode;
        token.profileSlug = user.profileSlug;
        token.partnerOneName = user.partnerOneName;
        token.partnerTwoName = user.partnerTwoName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.weddingCode = token.weddingCode as string;
        session.user.profileSlug = token.profileSlug as string;
        session.user.partnerOneName = token.partnerOneName as string;
        session.user.partnerTwoName = token.partnerTwoName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
