'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z, ZodType } from 'zod';

import { authenticateUser, UnauthorizedError } from '@/src/actions/auth';
import DBConnection from '@/src/db/DBConnection';
import UserRepository, { UserAlreadyExistsError } from '@/src/db/models/user';
import { SignInData, SignUpData } from '@/src/types/api';
import { FormActionState } from '@/src/types/form';

const signUpDataSchema = z.object({
  username: z
    .string()
    .trim()
    .refine((s) => !/\s/.test(s), 'Username can not contain whitespace')
    .min(4, 'Username must be at least 4 characters')
    .max(20, 'Username must be at most 10 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(25, 'Password must be at most 25 characters'),
}) satisfies ZodType<SignUpData>;

export type SignInActionState = FormActionState<SignInData>;

export const signIn = async (
  _initialSignInState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> => {
  const rawData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };

  try {
    const jwt = await authenticateUser(rawData);

    const cookieStore = await cookies();
    cookieStore.set('jwt', jwt, { httpOnly: true });
  } catch (error) {
    console.error('Failed to sign in user', error);
    if (error instanceof UnauthorizedError) {
      return {
        success: false,
        data: rawData,
        error: 'Incorrect username or password',
      };
    }
    return {
      success: false,
      data: rawData,
      error: 'Error, try again later',
    };
  }
  redirect('/home');
  return {
    success: true,
  };
};

export type SignUpActionState = FormActionState<SignUpData>;

export const signUp = async (
  _initialState: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> => {
  const rawData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };
  const validatedFields = signUpDataSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      data: rawData,
      errors: z.treeifyError(validatedFields.error).properties,
    };
  }

  try {
    await DBConnection.connect();

    const userRepo = new UserRepository();
    const user = await userRepo.create(validatedFields.data);
    console.log('User created successfully', user);
  } catch (error) {
    console.error('Failed to create user', error);
    if (error instanceof UserAlreadyExistsError) {
      return {
        success: false,
        data: validatedFields.data,
        error: 'Username already in use',
      };
    }
    return {
      success: false,
      data: validatedFields.data,
      error: 'Could not sign up. Try again later',
    };
  }

  return {
    success: true,
  };
};
