import z, { ZodType } from 'zod';

import DBConnection from '@/src/db/DBConnection';
import UserRepository from '@/src/db/models/user';
import { CreateTeamData } from '@/src/types/api';

export const createTeamDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 characters')
    .max(40, 'Name must be at most 40 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters'),
  data: z
    .string()
    .min(1, 'Data must be at least 1 characters')
    .max(5000, 'Data must be at most 5000 characters'),
  season: z
    .number()
    .min(2008)
    .max(new Date().getFullYear() + 1),
  format: z
    .string()
    .min(1, 'Format must be at least 1 characters')
    .max(50, 'Format must be at most 50 characters'),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Tag must be at least 1 character')
        .max(20, 'Tag must be at most 20 characters'),
    )
    .max(10, 'At most 10 tags are allowed'),
}) satisfies ZodType<CreateTeamData>;

export const validateCreateTeamData = (data: unknown) => {
  return createTeamDataSchema.safeParse(data);
};

export const createTeamForUser = async (
  userId: string,
  teamData: CreateTeamData,
) => {
  await DBConnection.connect();

  const userRepo = new UserRepository();
  const team = await userRepo.addNewTeam(userId, teamData);

  return team;
};
