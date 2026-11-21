import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Helper to add strict cache busting headers to protected responses
  const applyNoCacheHeaders = (res: NextResponse) => {
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  };

  // 1. Admin Portal Protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = req.cookies.get("ww_admin_session")?.value;
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    const response = NextResponse.next();
    return applyNoCacheHeaders(response);
  }

  // 2. Guest Protected Routes (e.g. /guest/history)
  if (pathname.startsWith("/guest/history")) {
    const guestToken = req.cookies.get("ww_guest_session")?.value;
    if (!guestToken) {
      const guestLoginUrl = new URL("/guest", req.url);
      return NextResponse.redirect(guestLoginUrl);
    }
    const response = NextResponse.next();
    return applyNoCacheHeaders(response);
  }

  // 3. Couple Portal Protection
  const couplePaths = [
    "/dashboard",
    "/goals",
    "/contributions",
    "/profile",
    "/settings",
    "/wishes",
    "/ai",
  ];
  const isCoupleProtected = couplePaths.some((p) => pathname.startsWith(p));
  if (isCoupleProtected) {
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "default_development_secret_do_not_use_in_prod",
    });
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const response = NextResponse.next();
    return applyNoCacheHeaders(response);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/goals/:path*",
    "/contributions/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/wishes/:path*",
    "/ai/:path*",
    "/guest/history",
    "/api/couple/:path*",
    "/api/goals/:path*",
  ],
};
