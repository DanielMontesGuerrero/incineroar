import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import DBConnection from '@/src/db/DBConnection';
import { TrainingNotFoundError } from '@/src/db/models/training';
import UserRepository from '@/src/db/models/user';
import { TrainingAnalyticsService } from '@/src/services/pokemon/analytics';
import { ErrorResponse } from '@/src/types/api';
import { GET_TRAINING_ANALYSIS } from '@/src/types/endpoints';

export const GET = async (
  req: NextRequest,
  ctx: RouteContext<'/api/user/training/[trainingId]/analyze'>,
): Promise<NextResponse<GET_TRAINING_ANALYSIS | ErrorResponse>> => {
  try {
    await DBConnection.connect();
    const userRepo = new UserRepository();
    const analyticsService = new TrainingAnalyticsService();

    const { id: userId } = await verifyUserAuth(req);
    const { trainingId } = await ctx.params;
    const training = await userRepo.getTrainingById(userId, trainingId);
    const analysis = analyticsService.getAnalytics(training);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Failed to get training', error);
    if (error instanceof TrainingNotFoundError) {
      return NextResponse.json(
        { message: 'Training not found' },
        { status: 404 },
      );
    }
    return baseErrorHandler(error, req);
  }
};
