import z, { ZodType } from 'zod';

import DBConnection from '@/src/db/DBConnection';
import UserRepository from '@/src/db/models/user';
import { Team } from '@/src/types/api';
import { AddTrainingFormData } from '@/src/types/form';

export const addTrainingFormDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 characters')
    .max(40, 'Name must be at most 40 characters'),
  teamId: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters'),
  season: z
    .number()
    .min(2008)
    .max(new Date().getFullYear() + 1)
    .optional(),
  format: z
    .string()
    .min(1, 'Format must be at least 1 characters')
    .max(50, 'Format must be at most 50 characters')
    .optional(),
}) satisfies ZodType<AddTrainingFormData>;

export const validateCreateTrainingData = (data: unknown) => {
  return addTrainingFormDataSchema.safeParse(data);
};

export const createTrainingForUser = async (
  userId: string,
  trainingData: AddTrainingFormData,
) => {
  await DBConnection.connect();

  const userRepo = new UserRepository();

  let team: Team | undefined = undefined;
  if (trainingData.teamId) {
    team = await userRepo.getTeamById(userId, trainingData.teamId);
  }

  const createData = {
    ...trainingData,
    team,
    description: trainingData.description ?? '',
  };

  const training = await userRepo.addNewTraining(userId, createData);
  return training;
};
