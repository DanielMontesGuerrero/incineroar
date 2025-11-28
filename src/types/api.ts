import { type PokemonSet } from '@/src/services/pokemon';

export interface Team {
  id: string;
  data: string;
  season: number;
  format: string;
  tags: string[];
  name: string;
  description: string;
  parsedTeam: Partial<PokemonSet>[];
  createdAt: string;
}

export type CreateTeamData = Omit<Team, 'id' | 'parsedTeam' | 'createdAt'>;
export type UpdateTeamData = Omit<Team, 'parsedTeam' | 'createdAt'>;

export interface User {
  id: string;
  username: string;
  password: string;
  teams: Team[];
  createdAt: string;
}

export type SignUpData = Pick<User, 'username' | 'password'>;

export type SignInData = Pick<SignUpData, 'username' | 'password'>;

export type UnsensitiveUserData = Pick<User, 'username' | 'id'>;

export type ExposedUser = Omit<User, 'password'>;

export interface ErrorResponse {
  message: string;
}

export interface TournamentTeam {
  player: string;
  data: string;
  team: Partial<PokemonSet>[];
}

export interface Tournament {
  id: string;
  name: string;
  season: number;
  format: string;
  teams: TournamentTeam[];
  createdAt: string;
}

export type CreateTournamentData = Omit<
  Tournament,
  'teams' | 'createdAt' | 'id'
> & {
  teams: Omit<TournamentTeam, 'team'>[];
};

export interface Usage<T = string> {
  value: T;
  percentage: number;
}

export interface EvUsage {
  stat: keyof PokemonSet['evs'];
  values: Usage<number>[];
  average: number;
}

export interface PokemonAnalytics {
  species: string;
  usage: number;
  abilities: Usage[];
  items: Usage[];
  moves: Usage[];
  teraTypes: Usage[];
  evs: EvUsage[];
}

export interface TeamAnalytics {
  usage: number;
  pokemon: string[];
}

export interface AnalyticsResponse {
  pokemon: PokemonAnalytics[];
  cores: Record<number, TeamAnalytics[]>;
}
