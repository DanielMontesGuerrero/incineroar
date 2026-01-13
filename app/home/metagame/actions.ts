'use server';

import z from 'zod';

import { UnauthorizedError, verifyUserAuth } from '@/src/actions/auth';
import { baseFormActionErrorHandler } from '@/src/actions/error-handlers';
import {
  createTournamentWithAuth,
  validateCreateTournamentData,
} from '@/src/actions/tournament';
import { AddTournamentFormData, FormActionState } from '@/src/types/form';

export type CreateTournamentActionState =
  FormActionState<AddTournamentFormData>;

export const createTournament = async (
  _state: CreateTournamentActionState,
  formData: FormData,
): Promise<CreateTournamentActionState> => {
  const rawData = {
    name: formData.get('name') as string,
    season: Number(formData.get('season')),
    format: formData.get('format') as string,
    source: formData.get('source') as 'pokedata_url' | 'pokedata',
    data: formData.get('data') as string,
  };

  const validatedFields = validateCreateTournamentData(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      data: rawData,
      errors: z.treeifyError(validatedFields.error).properties,
    };
  }

  try {
    const { role: userRole } = await verifyUserAuth();

    if (userRole !== 'admin') {
      throw new UnauthorizedError();
    }

    const tournament = await createTournamentWithAuth(validatedFields.data);
    console.log('Tournament successfully created', tournament);
  } catch (error) {
    console.error('Failed to create tournament', error);
    if (error instanceof UnauthorizedError) {
      return {
        success: false,
        data: validatedFields.data,
        error: 'Unauthorized',
      };
    }
    if (error instanceof SyntaxError) {
      return {
        success: false,
        data: validatedFields.data,
        error: 'Invalid JSON data',
      };
    }
    return baseFormActionErrorHandler(
      error,
      validatedFields.data,
      'Failed to add tournament. Try again later',
    );
  }

  return { success: true };
};
