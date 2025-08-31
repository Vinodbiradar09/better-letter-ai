import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const protectedRoutes = ["/cool", "/leave/letter", "/leave/history"];
  const authRoutes = ["/sign-in", "/sign-up"];
  const publicRoutes = ["/"];

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isProtectedRoute) {
    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (!token.isVerified) {
      const verifyUrl = new URL("/verify", request.url);
      verifyUrl.searchParams.set("email", token.email as string);
      return NextResponse.redirect(verifyUrl);
    }
    return NextResponse.next();
  }
  if (isAuthRoute) {
    if (token && token.isVerified) {
      return NextResponse.redirect(new URL("/cool", request.url));
    }

    if (token && !token.isVerified) {
      const verifyUrl = new URL("/verify", request.url);
      verifyUrl.searchParams.set("email", token.email as string);
      return NextResponse.redirect(verifyUrl);
    }

    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images, css, js files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(png|jpg|jpeg|gif|webp|svg|css|js)$).*)",
  ],
};
