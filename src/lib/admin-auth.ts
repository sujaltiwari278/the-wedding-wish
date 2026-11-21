import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "ww_admin_session";
const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "wedding-wish-admin-secret-2027";

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  role: string;
}

export function signAdminToken(admin: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export function verifyAdminToken(token: string): AdminSessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminSessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function createAdminCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; ${
    isProd ? "Secure;" : ""
  }`;
}

export function clearAdminCookieHeader(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;`;
}
