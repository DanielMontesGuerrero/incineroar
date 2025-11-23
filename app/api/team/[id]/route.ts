import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import DBConnection from '@/src/db/DBConnection';
import UserRepository from '@/src/db/models/user';
import { ErrorResponse } from '@/src/types/api';

export const DELETE = async (
  req: NextRequest,
  ctx: RouteContext<'/api/team/[id]'>,
): Promise<NextResponse | ErrorResponse> => {
  try {
    await DBConnection.connect();
    const userRepo = new UserRepository();

    const { id: userId } = await verifyUserAuth();
    const { id: teamId } = await ctx.params;
    await userRepo.deleteTeam(userId, teamId);
    console.log(`Deleted team ${teamId} for user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete team`, error);
    return baseErrorHandler(error);
  }
};
