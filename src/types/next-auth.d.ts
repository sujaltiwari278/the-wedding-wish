import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      weddingCode: string;
      profileSlug: string;
      partnerOneName: string;
      partnerTwoName: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    weddingCode: string;
    profileSlug: string;
    partnerOneName: string;
    partnerTwoName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    weddingCode: string;
    profileSlug: string;
    partnerOneName: string;
    partnerTwoName: string;
  }
}
