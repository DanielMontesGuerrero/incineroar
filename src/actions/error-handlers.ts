import { NextResponse } from 'next/server';

import { UnauthenticatedError, UnauthorizedError } from './auth';

export const baseErrorHandler = (error: unknown) => {
  if (error instanceof UnauthenticatedError) {
    return new NextResponse(null, {
      status: 401,
    });
  }
  if (error instanceof UnauthorizedError) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return new NextResponse(null, {
    status: 500,
  });
};
