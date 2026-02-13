import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routeToFeature: Record<string, string> = {
  '/products': 'FEATURE_PRODUCTS',
  '/sellers': 'FEATURE_SELLERS',
  '/assignments': 'FEATURE_ASSIGNMENTS',
  '/history': 'FEATURE_HISTORY',
  '/sales': 'FEATURE_SALES',
  '/statistics': 'FEATURE_STATISTICS',
  '/settings': 'FEATURE_SETTINGS',
};

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar autenticación
  const token = request.cookies.get('payload-token');
  const isAuthenticated = !!token?.value;

  // Si es ruta pública, permitir acceso
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    // Si ya está autenticado y va a login/register, redirigir a dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if this route has a feature flag
  const featureEnvKey = routeToFeature[pathname];

  if (featureEnvKey) {
    const isEnabled = process.env[featureEnvKey] === 'true';

    if (!isEnabled) {
      // Redirect to dashboard if feature is disabled
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/products',
    '/sellers',
    '/assignments',
    '/history',
    '/sales',
    '/statistics',
    '/settings',
    '/profile',
    '/login',
    '/register',
  ],
};
