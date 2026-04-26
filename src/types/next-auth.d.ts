import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      nick: string | null;
      onboardingCompleted: boolean;
    };
  }

  interface User {
    role: UserRole;
    nick?: string | null;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    nick?: string | null;
    onboardingCompleted?: boolean;
  }
}
