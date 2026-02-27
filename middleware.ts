import { auth } from "@/lib/auth";

export default auth((req) => {
  const isSignedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (isAuthPage) {
    if (isSignedIn) {
      return Response.redirect(new URL("/contracts", req.url));
    }
    return;
  }

  if (!isSignedIn) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  return;
});

export const config = {
  matcher: ["/contracts/:path*", "/auth/:path*"],
};
