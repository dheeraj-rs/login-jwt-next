import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes and public files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const isAuthenticated = await validateRequest(request);
  
  // Authentication logic
  if (!isAuthenticated && !pathname.startsWith('/auth')) {
    // Redirect to login if trying to access protected routes
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirect to dashboard if trying to access login/signup when already authenticated
  if (isAuthenticated && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};