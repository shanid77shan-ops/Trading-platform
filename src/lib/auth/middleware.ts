import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./constants";
import { verifySessionToken } from "./verify-token";

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth")
  );
}

export async function updateSession(request: NextRequest) {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return NextResponse.next({ request });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");
  const isPublicRoute = isPublicPath(pathname);

  if (!user && !isPublicRoute) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
