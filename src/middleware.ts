import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "osis_admin_session";
const USER_COOKIE_NAME = "osis_user_session";

async function isValidSession(
  token: string | undefined,
  expectedPayloadCheck: (payload: Record<string, unknown>) => boolean,
) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return expectedPayloadCheck(payload);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const valid = await isValidSession(token, (p) => p.role === "admin");
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/events")) &&
    pathname !== "/login"
  ) {
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    const valid = await isValidSession(token, (p) => typeof p.email === "string");
    if (!valid) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/events/:path*"],
};
