import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import DBConnection from '../db/DBConnection';
import UserRepository from '../db/models/user';
import AuthService from '../services/auth';
import { SignInData, UnsensitiveUserData } from '../types/api';

export const verifyUserAuth = async (
  req?: NextRequest,
): Promise<UnsensitiveUserData> => {
  const authService = new AuthService();
  const cookieStore = await cookies();
  let jwt = cookieStore.get('jwt')?.value;
  if (!jwt && req) {
    const authHeader = req.headers.get('authorization');
    jwt = authHeader?.slice(7);
  }
  if (!jwt) {
    throw new UnauthenticatedError();
  }
  const verifyResult = await authService.verifyUserJwt(jwt);
  if (!verifyResult.verified || !verifyResult.user) {
    throw new UnauthorizedError();
  }
  return verifyResult.user;
};

export const authenticateUser = async (userCredentials: SignInData) => {
  await DBConnection.connect();
  const userRepo = new UserRepository();
  const user = await userRepo.exists(userCredentials);
  if (user === undefined) {
    throw new UnauthorizedError();
  }
  const authService = new AuthService();
  return await authService.createUserJwt(user);
};

export class UnauthenticatedError extends Error {}
export class UnauthorizedError extends Error {}
