import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import {
  createBattleForTraining,
  validateCreateBattleData,
} from '@/src/actions/battle';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import { TrainingNotFoundError } from '@/src/db/models/training';
import { ErrorResponse } from '@/src/types/api';
import { POST_BATTLE } from '@/src/types/endpoints';

export const POST = async (
  req: NextRequest,
  ctx: RouteContext<'/api/user/training/[trainingId]/battle'>,
): Promise<NextResponse<POST_BATTLE | ErrorResponse>> => {
  try {
    const { id: userId } = await verifyUserAuth(req);
    const { trainingId } = await ctx.params;
    const body = (await req.json()) as unknown;
    const validatedFields = validateCreateBattleData(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      );
    }

    const battle = await createBattleForTraining(
      userId,
      trainingId,
      validatedFields.data,
    );
    console.log('Battle created successfully', battle);

    return NextResponse.json({ battle }, { status: 201 });
  } catch (error) {
    console.error('Failed to create battle', error);
    if (error instanceof TrainingNotFoundError) {
      return NextResponse.json(
        { message: 'Training not found' },
        { status: 404 },
      );
    }
    return baseErrorHandler(error, req);
  }
};
