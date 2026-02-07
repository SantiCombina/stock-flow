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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
  matcher: ['/products', '/sellers', '/assignments', '/history', '/sales', '/statistics', '/settings'],
};
