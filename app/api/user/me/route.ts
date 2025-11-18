import { NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import DBConnection from '@/src/db/DBConnection';
import UserRepository from '@/src/db/models/user';

export const GET = async () => {
  const userRepo = new UserRepository();
  try {
    await DBConnection.connect();
    const { id } = await verifyUserAuth();
    const user = await userRepo.getById(id);
    user.password = undefined;
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get user', error);
    return baseErrorHandler(error);
  }
};
