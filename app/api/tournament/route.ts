import { NextRequest, NextResponse } from 'next/server';

import { UnauthorizedError, verifyUserAuth } from '@/src/actions/auth';
import { baseErrorHandler } from '@/src/actions/error-handlers';
import {
  createTournamentWithAuth,
  validateCreateTournamentData,
} from '@/src/actions/tournament';
import DBConnection from '@/src/db/DBConnection';
import TournamentRepository from '@/src/db/models/tournament';
import { ErrorResponse } from '@/src/types/api';
import { GET_TOURNAMENTS, POST_TOURNAMENT } from '@/src/types/endpoints';

export const GET = async (
  req: NextRequest,
): Promise<NextResponse<GET_TOURNAMENTS | ErrorResponse>> => {
  try {
    await DBConnection.connect();
    await verifyUserAuth(req);

    const tournamentRepo = new TournamentRepository();
    const tournaments = await tournamentRepo.getAll();

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('Failed to get tournaments', error);
    return baseErrorHandler(error, req);
  }
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<POST_TOURNAMENT | ErrorResponse>> => {
  try {
    const { role: userRole } = await verifyUserAuth(req);
    const body: unknown = await req.json();
    const validatedFields = validateCreateTournamentData(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      );
    }

    if (userRole !== 'admin') {
      throw new UnauthorizedError();
    }

    const tournament = await createTournamentWithAuth(validatedFields.data);
    console.log('Tournament created successfully', tournament);

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error('Failed to create tournament', error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Invalid JSON data' },
        { status: 400 },
      );
    }
    return baseErrorHandler(error, req);
  }
};
