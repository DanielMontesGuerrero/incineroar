import { NextRequest, NextResponse } from 'next/server';

import { authenticateUser, UnauthorizedError } from '@/src/actions/auth';
import { ErrorResponse, SignInData } from '@/src/types/api';
import { POST_AUTH, REQ_POST_AUTH } from '@/src/types/endpoints';

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<POST_AUTH | ErrorResponse>> => {
  try {
    const userCredentials = (await req.json()) as unknown as REQ_POST_AUTH;
    if (!userCredentials.username || !userCredentials.password) {
      return NextResponse.json(
        { message: 'Missing username or password' },
        { status: 400 },
      );
    }
    const jwt = await authenticateUser(userCredentials as SignInData);
    return NextResponse.json({ jwt });
  } catch (error) {
    console.error('Failed to authenticate credentials', error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
};
