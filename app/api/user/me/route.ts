import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import DBConnection from '@/src/db/DBConnection';
import UserRepository from '@/src/db/models/user';
import { ErrorResponse } from '@/src/types/api';
import { GET_ME } from '@/src/types/endpoints';

export const GET = async (
  req: NextRequest,
): Promise<NextResponse<GET_ME | ErrorResponse>> => {
  try {
    await DBConnection.connect();
    const userRepo = new UserRepository();

    const { id } = await verifyUserAuth(req);
    const { password: _, ...user } = await userRepo.getById(id);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get user', error);
    return baseErrorHandler(error, req);
  }
};

export const DELETE = async (
  req: NextRequest,
): Promise<NextResponse<void | ErrorResponse>> => {
  try {
    await DBConnection.connect();
    const userRepo = new UserRepository();

    const { id } = await verifyUserAuth(req);
    await userRepo.deleteById(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete user', error);
    return baseErrorHandler(error, req);
  }
};
