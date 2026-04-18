import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request);
  const { pathname } = request.nextUrl;

  // Let auth0 handle its own routes
  if (pathname.startsWith('/auth')) {
    return authRes;
  }

  // Public routes — no session needed
  if (pathname === '/') {
    return authRes;
  }

  // All other routes require a session
  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login?returnTo=' + pathname, request.url));
  }

  return authRes;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};