'use server';

import { verifyUserAuth } from '@/src/actions/auth';
import DBConnection from '@/src/db/DBConnection';
import TeamRepository from '@/src/db/models/team';
import TournamentRepository from '@/src/db/models/tournament';
import TrainingRepository, { BattleRepository } from '@/src/db/models/training';
import UserRepository from '@/src/db/models/user';
import AnalyticsService from '@/src/services/pokemon/analytics';
import TeamService from '@/src/services/pokemon/team';
import {
  CreateTeamData,
  CreateTournamentData,
  TournamentTeam,
} from '@/src/types/api';
import {
  createRandomBattle,
  createRandomTraining,
  sampleTeams,
} from '@/src/utils/test-utils';

export const testTeamsRepository = async () => {
  const sampleTeam = sampleTeams[0];
  console.log('Starting script...');

  await DBConnection.connect();

  const userRepo = new UserRepository();
  const teamRepo = new TeamRepository();
  const { id: userId } = await verifyUserAuth();

  const newTeamData: CreateTeamData = {
    data: sampleTeam,
    tags: ['tag 1', 'tag 2'],
    name: `team created on ${new Date().toLocaleString()}`,
    description: 'My description',
    format: 'reg h',
    season: 2025,
  };

  console.log('Creating team');
  const createdTeam = await userRepo.addNewTeam(userId, newTeamData);
  console.log('Created team', createdTeam);

  console.log('Get all team');
  const user = await userRepo.getById(userId);
  console.log('Got all teams', user.teams);

  console.log('Updating team');
  const updatedTeam = await teamRepo.updateById(createdTeam.id, {
    description: `Updated on ${new Date().toISOString()}`,
    data: 'data updated',
  });
  const updatedTeam2 = await teamRepo.getById(createdTeam.id);
  console.log('Updated team', updatedTeam);
  console.log('Updated team2', updatedTeam2);

  console.log('Deleting team');
  await userRepo.deleteTeam(userId, createdTeam.id);
  console.log('Deleted team');
  const updatedUser = await userRepo.getById(userId);
  console.log('Updated user', updatedUser);
  try {
    await teamRepo.getById(createdTeam.id);
    console.error('Failed to delete');
  } catch (e) {
    console.log('Not found team', e);
  }

  console.log('Done');
};

export const testCreateTournament = async () => {
  const sampleTeam = sampleTeams[0];
  const tournament: CreateTournamentData = {
    name: `Tournament on ${new Date().toLocaleString()}`,
    season: new Date().getFullYear(),
    format: 'Reg h',
    teams: [
      {
        player: 'Player 1',
        data: sampleTeam,
      },
      {
        player: 'Player 2',
        data: sampleTeam,
      },
      {
        player: 'Player 3',
        data: sampleTeam,
      },
    ],
  };
  console.log('Creating tournament', tournament);
  await DBConnection.connect();
  const repo = new TournamentRepository();
  const createdT = await repo.create(tournament);
  console.log('Tournament created', createdT);
  const foundT = await repo.getById(createdT.id);
  console.log('Found tournament', foundT);
};

export const testDeleteTournament = async (formData: FormData) => {
  const id = formData.get('id') as string;
  await DBConnection.connect();
  const repo = new TournamentRepository();
  console.log('Deleting team', id);
  await repo.deleteById(id);
  try {
    await repo.getById(id);
  } catch (err) {
    console.log('Not found deleted team', err);
  }
};

export const testAnalyzeTournament = async () => {
  console.log(new Map().entries() instanceof Iterator);
  const teamService = new TeamService();
  const tournamentTeams: TournamentTeam[] = [
    {
      player: 'player 1',
      data: '',
      team: teamService.parseTeam(sampleTeams[0]),
    },
    {
      player: 'player 2',
      data: '',
      team: teamService.parseTeam(sampleTeams[1]),
    },
    {
      player: 'player 3',
      data: '',
      team: teamService.parseTeam(sampleTeams[2]),
    },
    {
      player: 'player 4',
      data: '',
      team: teamService.parseTeam(sampleTeams[3]),
    },
  ];
  console.log('Analyzing tournament', tournamentTeams);
  const service = new AnalyticsService();
  const result = await service.getAnalytics(tournamentTeams);
  console.log('Done');
  console.log(result);
};

export const testCreateTraining = async () => {
  await DBConnection.connect();
  const userRepo = new UserRepository();
  const trainingRepo = new TrainingRepository();

  const { id: userId } = await verifyUserAuth();
  const createTData = createRandomTraining();
  const training = await userRepo.addNewTraining(userId, createTData);
  const foundTraining = await trainingRepo.getById(training.id);
  console.log('Created training', foundTraining);
  const updatedTraining = await userRepo.updateTraining(userId, training.id, {
    description: 'Updated description',
    isDefault: true,
  });
  console.log('Updated training', updatedTraining);
};

export const testDeleteTraining = async (formData: FormData) => {
  const id = formData.get('id') as string;
  await DBConnection.connect();
  const userRepo = new UserRepository();
  const trainingRepo = new TrainingRepository();

  const { id: userId } = await verifyUserAuth();
  await userRepo.deleteTraining(userId, id);
  try {
    await trainingRepo.getById(id);
    console.error('Failed to delete');
  } catch (_err) {
    console.log('Not found deleted training');
  }
  console.log('Deleted training');
};

export const testCreateBattle = async (formData: FormData) => {
  const trainingId = formData.get('trainingId') as string;
  await DBConnection.connect();
  const userRepo = new UserRepository();
  const battleRepo = new BattleRepository();

  const { id: userId } = await verifyUserAuth();
  const battleData = createRandomBattle();
  const createdBattle = await userRepo.addNewBattle(
    userId,
    trainingId,
    battleData,
  );
  const battle = await battleRepo.getById(createdBattle.id);
  console.log('Created battle', battle);
  const updatedBattle = await userRepo.updateBattle(
    userId,
    trainingId,
    battle.id,
    { notes: 'Updated notes' },
  );
  console.log('Updated battle', updatedBattle);
};

export const testDeleteBattle = async (formData: FormData) => {
  const trainingId = formData.get('trainingId') as string;
  const battleId = formData.get('battleId') as string;
  await DBConnection.connect();
  const userRepo = new UserRepository();
  const battleRepo = new BattleRepository();

  const { id: userId } = await verifyUserAuth();
  await userRepo.deleteBattle(userId, trainingId, battleId);
  try {
    await battleRepo.getById(battleId);
    console.error('Failed to delete battle');
  } catch (_err) {
    console.log('Not found deleted battle');
  }
  console.log('Deleted battle');
};
