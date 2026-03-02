import { auth } from "@/lib/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // Redirect old sign-in URL to Home (login is optional/demo only)
  if (pathname.startsWith("/auth")) {
    return Response.redirect(new URL("/", req.url));
  }

  // All routes are public; sign-in is optional for demo
  return;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
