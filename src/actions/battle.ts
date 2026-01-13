import z, { ZodType } from 'zod';

import DBConnection from '@/src/db/DBConnection';
import UserRepository from '@/src/db/models/user';
import { TupleUnion } from '@/src/types';
import { Action, Battle, CreateBattleData, Turn } from '@/src/types/api';

const actionTypes: TupleUnion<Action['type']> = [
  'move',
  'switch',
  'ability',
  'effect',
];
const playerTypes: TupleUnion<Exclude<Action['player'], undefined>> = [
  'p1',
  'p2',
  'p3',
  'p4',
];
const battleResults: TupleUnion<Exclude<Battle['result'], undefined>> = [
  'win',
  'loose',
  'tie',
];

const actionFormDataSchema = z.object({
  index: z.number(),
  player: z
    .union(
      playerTypes.map((val) => z.literal(val)),
      'Invalid player',
    )
    .optional(),
  type: z.union(
    actionTypes.map((val) => z.literal(val)),
    'Invalid action type',
  ),
  name: z.string(),
  user: z.string(),
  targets: z
    .array(z.string().max(50, 'At most 50 characters'))
    .max(10, 'At most 10 targets'),
}) satisfies ZodType<Action>;

const turnFormDataSchema = z.object({
  index: z.number(),
  actions: z.array(actionFormDataSchema),
}) satisfies ZodType<Turn>;

const createBattleDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 characters')
    .max(40, 'Name must be at most 40 characters'),
  result: z
    .union(
      battleResults.map((val) => z.literal(val)),
      'Invalid result',
    )
    .optional(),
  notes: z.string().max(5000, 'Notes must be at most 5000 characters'),
  turns: z.array(turnFormDataSchema),
}) satisfies ZodType<CreateBattleData>;

export const validateCreateBattleData = (data: unknown) => {
  return createBattleDataSchema.safeParse(data);
};

export const createBattleForTraining = async (
  userId: string,
  trainingId: string,
  battleData: CreateBattleData,
) => {
  await DBConnection.connect();

  const userRepo = new UserRepository();

  return await userRepo.addNewBattle(userId, trainingId, battleData);
};
