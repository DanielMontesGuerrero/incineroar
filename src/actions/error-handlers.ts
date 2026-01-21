import { NextRequest, NextResponse } from 'next/server';

import { TrainingStorageExceededError } from '../db/models/training';
import {
  UserNotFoundError,
  UserStorageLimitExceededError,
} from '../db/models/user';
import { ErrorResponse } from '../types/api';
import { MissingDBConnectionError } from '../utils/errors';
import { UnauthenticatedError, UnauthorizedError } from './auth';

export const baseErrorHandler = (
  error: unknown,
  _req: NextRequest,
): NextResponse<ErrorResponse> => {
  if (error instanceof UnauthenticatedError) {
    return NextResponse.json<ErrorResponse>(
      { message: 'User not authenticaded' },
      {
        status: 401,
      },
    );
  }
  if (error instanceof UnauthorizedError) {
    return NextResponse.json<ErrorResponse>(
      { message: 'User not authorized' },
      {
        status: 403,
      },
    );
  }
  if (error instanceof MissingDBConnectionError) {
    return NextResponse.json<ErrorResponse>(
      { message: 'DB not available' },
      {
        status: 500,
      },
    );
  }
  if (error instanceof UserStorageLimitExceededError) {
    return NextResponse.json<ErrorResponse>(
      {
        message: `Limit of ${error.limit} exceeded.`,
      },
      { status: 507 },
    );
  }
  if (error instanceof TrainingStorageExceededError) {
    return NextResponse.json<ErrorResponse>(
      {
        message: `Limit of ${error.limit} exceeded.`,
      },
      { status: 507 },
    );
  }
  return NextResponse.json<ErrorResponse>(
    { message: 'Unexpected error' },
    {
      status: 500,
    },
  );
};

export const baseFormActionErrorHandler = <T>(
  error: unknown,
  data: T,
  defaultErrorMessage: string,
) => {
  if (
    error instanceof UserNotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return {
      success: false,
      data: data,
      error: 'User not found',
    };
  }
  if (error instanceof MissingDBConnectionError) {
    return {
      success: false,
      data,
      error: 'DB not available',
    };
  }
  if (error instanceof UserStorageLimitExceededError) {
    return {
      success: false,
      data,
      error: `Can not create, exceeded limit of ${error.limit}`,
    };
  }
  if (error instanceof TrainingStorageExceededError) {
    return {
      success: false,
      data,
      error: `Can not create, exceeded limit of ${error.limit}`,
    };
  }
  return {
    success: false,
    data: data,
    error: defaultErrorMessage,
  };
};
