import { Route } from 'next';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from './src/actions/auth';

const protectedRoutes: Route[] = ['/home'];
const authRoute: Route = '/auth';

const disabledRoutes: Record<string, Route[]> = {
  prod: ['/dev'],
  qa: ['/dev'],
  dev: ['/dev'],
};

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

const protectedRouteProxy = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt');
  if (!jwt) {
    return NextResponse.redirect(new URL('/auth', req.nextUrl));
  }
  try {
    await verifyUserAuth();
  } catch (err) {
    console.error('Invalid jwt', err);
    cookieStore.delete('jwt');
    return NextResponse.redirect(new URL('/auth', req.nextUrl));
  }
  return NextResponse.next();
};

const authRouteProxy = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt');
  if (jwt) {
    return NextResponse.redirect(new URL('/home', req.nextUrl));
  }
  return NextResponse.next();
};

const proxy = async (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  const isDisabledRoute = (
    disabledRoutes[process.env.NEXT_PUBLIC_ENVIRONMENT ?? ''] ?? []
  ).some((route) => path.startsWith(route));
  if (isDisabledRoute) {
    return NextResponse.json({}, { status: 404 });
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  if (isProtectedRoute) {
    return protectedRouteProxy(req);
  }

  const isAuthRoute = path.startsWith(authRoute);
  if (isAuthRoute) {
    return authRouteProxy(req);
  }

  return NextResponse.next();
};

export default proxy;
