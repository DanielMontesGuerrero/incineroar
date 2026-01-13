import { NextRequest, NextResponse } from 'next/server';

import { verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import {
  createTrainingForUser,
  validateCreateTrainingData,
} from '@/src/actions/training';
import DBConnection from '@/src/db/DBConnection';
import { TeamNotFoundError } from '@/src/db/models/team';
import UserRepository from '@/src/db/models/user';
import { ErrorResponse } from '@/src/types/api';
import { GET_TRAININGS, POST_TRAINING } from '@/src/types/endpoints';

export const GET = async (
  req: NextRequest,
): Promise<NextResponse<GET_TRAININGS | ErrorResponse>> => {
  try {
    await DBConnection.connect();
    const { id } = await verifyUserAuth(req);

    const userRepo = new UserRepository();
    const trainings = await userRepo.getTrainings(id);
    trainings.reverse();

    return NextResponse.json({ trainings });
  } catch (error) {
    console.error('Failed to get trainings', error);
    return baseErrorHandler(error, req);
  }
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<POST_TRAINING | ErrorResponse>> => {
  try {
    const { id: userId } = await verifyUserAuth(req);
    const body: unknown = await req.json();
    const validatedFields = validateCreateTrainingData(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      );
    }

    const training = await createTrainingForUser(userId, validatedFields.data);
    console.log('Training created successfully', training);

    return NextResponse.json({ training }, { status: 201 });
  } catch (error) {
    console.error('Failed to create training', error);
    if (error instanceof TeamNotFoundError) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }
    return baseErrorHandler(error, req);
  }
};
