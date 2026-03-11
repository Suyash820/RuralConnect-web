import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes configuration
const protectedRoutes = {
  citizen: ['/citizen'],
  officer: ['/officer'],
  admin: ['/admin']
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Check if it's a protected route
  const isCitizenRoute = pathname.startsWith(protectedRoutes.citizen[0]);
  const isOfficerRoute = pathname.startsWith(protectedRoutes.officer[0]);
  const isAdminRoute = pathname.startsWith(protectedRoutes.admin[0]);

  if (isCitizenRoute || isOfficerRoute || isAdminRoute) {
    if (!token) {
      // Redirect to login if no token
      let roleQuery = '';
      if (isCitizenRoute) roleQuery = '?role=citizen';
      if (isOfficerRoute) roleQuery = '?role=officer';
      if (isAdminRoute) roleQuery = '?role=admin';
      
      return NextResponse.redirect(new URL(`/login${roleQuery}`, request.url));
    }

    // In a real middleware we might decode the JWT here to check role,
    // but we'll let the layout components or page components handle specific role checks
    // since we use a pure React context approach for user data right now.
  }

  // Redirect from root to citizen login if bare host is accessed
  if (pathname === '/') {
      return NextResponse.redirect(new URL('/login?role=citizen', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
