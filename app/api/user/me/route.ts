import { NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';

export const GET = async () => {
  try {
    const user = await verifyUserAuth();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get user', error);
    return baseErrorHandler(error);
  }
};
