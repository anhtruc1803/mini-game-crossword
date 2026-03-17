import { NextResponse, type NextRequest } from "next/server";
import { hasValidSessionToken, SESSION_COOKIE } from "@/lib/auth/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    const hasValidSession = await hasValidSessionToken(sessionToken);

    if (!hasValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
