import { NextRequest, NextResponse } from "next/server";

// SITE_PASSWORD gate — dev only. Remove this file (or unset SITE_PASSWORD) before launch.
// Protects the entire site with HTTP Basic Auth while in development.

export function proxy(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;

  // Gate is disabled when SITE_PASSWORD is not set.
  if (!sitePassword) return NextResponse.next();

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const encoded = authHeader.split(" ")[1];
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [, password] = decoded.split(":");

    if (password === sitePassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Access denied", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="KnittingBridge Dev", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
