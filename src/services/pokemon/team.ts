import { PokemonSet, Sets } from '@pkmn/sets';

export default class TeamService {
  parseTeam(rawTeam: string): Partial<PokemonSet>[] {
    const pokes = rawTeam.split(/\r\n\r\n|\n\n|\r\r/);
    return pokes.map((poke) => Sets.importSet(poke));
  }
}
