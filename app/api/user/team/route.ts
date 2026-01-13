import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import { createTeamForUser, validateCreateTeamData } from '@/src/actions/team';
import { ErrorResponse } from '@/src/types/api';
import { POST_TEAM } from '@/src/types/endpoints';

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<POST_TEAM | ErrorResponse>> => {
  try {
    const { id: userId } = await verifyUserAuth(req);
    const body: unknown = await req.json();
    const validatedFields = validateCreateTeamData(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      );
    }

    const team = await createTeamForUser(userId, validatedFields.data);
    console.log('Team created successfully', team);

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Failed to create team', error);
    return baseErrorHandler(error, req);
  }
};
