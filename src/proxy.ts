import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    const token = request.cookies.get('svt_admin_token')?.value;

    let isAuthenticated = false;

    if (token) {
      try {
        // Simple 3-part JWT structure check
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          const exp = payload.exp;
          // Check expiration timestamp
          if (exp && exp * 1000 > Date.now()) {
            isAuthenticated = true;
          }
        }
      } catch (err) {
        isAuthenticated = false;
      }
    }

    // If accessing admin page without valid token -> redirect to /admin/login
    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If already logged in and visiting /admin/login -> redirect to /admin/dashboard
    if (isAuthenticated && isLoginPage) {
      const dashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
