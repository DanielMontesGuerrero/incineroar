import { Action, Battle, CreateBattleData, Turn } from '@/src/types/api';

interface ActionWithContext extends Action {
  flags?: {
    isMissingTargets?: boolean;
  };
}

export type BattleMetadata = Omit<CreateBattleData, 'turns' | 'result'>;
export type ParserType = 'showdown-sim-protocol';

export interface BattleParser<T> {
  parserType: ParserType;
  parse(battle: BattleMetadata, rawData: T): CreateBattleData;
}

interface SSPPContext {
  currTurnIndex: number;
  turns: Turn[];
  currActions: ActionWithContext[];
  usernameToPlayerMap: { [key: string]: 'p1' | 'p2' | undefined };
  result?: Battle['result'];
  nicknameToPokemonMap: {
    p1: { [nickname: string]: string | undefined };
    p2: { [nickname: string]: string | undefined };
  };
}

type CommandHandler = (
  lineData: (string | undefined)[],
  ctx: SSPPContext,
) => void;

interface ParsedPokemon {
  player: string;
  pokemon: string;
  taggedPokemon: string;
}

interface RestData {
  from?: {
    type?: string;
    name?: string;
    raw?: string;
    fromName?: string;
  };
  inferredActionType: Action['type'];
  of?: ParsedPokemon;
  upkeep?: boolean;
}

export class ShowdownSimProtocolParser implements BattleParser<string[]> {
  parserType = 'showdown-sim-protocol' as const;

  handlerUtils = {
    pushTurn: (ctx: SSPPContext) => {
      ctx.turns.push({
        index: ctx.currTurnIndex,
        actions: ctx.currActions,
      });
      ctx.currActions = [];
    },
    pushAction: (
      action: Omit<ActionWithContext, 'index'>,
      ctx: SSPPContext,
    ) => {
      const index = ctx.currActions.length;
      ctx.currActions.push({
        index,
        ...action,
      });
    },
    findLastMoveAction: (ctx: SSPPContext) => {
      for (let index = 0; index < ctx.currActions.length; index++) {
        if (ctx.currActions.at(-(index + 1))?.type === 'move') {
          return ctx.currActions.at(-(index + 1));
        }
      }
      return undefined;
    },
    parsePokemon: (rawPokemon: string | undefined, ctx: SSPPContext) => {
      if (!rawPokemon) {
        throw new CommandHandlerError(
          'pokemon is undefined',
          [rawPokemon],
          ctx,
        );
      }
      const [rawPosition, rawName] = rawPokemon.split(':');
      const player = rawPosition.slice(0, 2) as 'p1' | 'p2';
      const nameOrNickname = rawName.trim();
      const pokemon =
        ctx.nicknameToPokemonMap[player][nameOrNickname] ?? nameOrNickname;
      return { player, pokemon, taggedPokemon: `${player}:${pokemon}` };
    },
    parsePokemonDetails: (details: string) => {
      const [rawSpecies, ...___] = details.split(',');
      const species = rawSpecies.trim();
      return { species };
    },
    parseRest: (
      lineData: (string | undefined)[] | undefined,
      ctx: SSPPContext,
    ): RestData => {
      const result: RestData = {
        inferredActionType: 'effect',
        from: undefined,
        of: undefined,
        upkeep: undefined,
      };
      if (!lineData) {
        return result;
      }
      lineData.forEach((line) => {
        if (!line) return;
        if (line.startsWith('[from]')) {
          const [type, rawName] = line.replace('[from]', '').trim().split(':');
          const name = rawName.trim();
          result.from = {
            type: name ? type : undefined,
            name: name ? name : undefined,
            raw: type,
          };
          result.inferredActionType = this.handlerUtils.getTypeFrom(result);
          result.from.fromName =
            result.inferredActionType === 'ability'
              ? result.from.name
              : result.from.raw;
        }
        if (line.startsWith('[of]')) {
          const rawPokemon = line.replace('[of]', '').trim();
          try {
            result.of = this.handlerUtils.parsePokemon(rawPokemon, ctx);
          } catch (_) {}
        }
        if (line.startsWith('[upkeep]')) {
          result.upkeep = true;
        }
      });
      return result;
    },
    registerPokemon: (lineData: (string | undefined)[], ctx: SSPPContext) => {
      const [_, rawPokemon, details, ...__] = lineData;
      if (!rawPokemon || !details) {
        throw new CommandHandlerError(
          'pokemon or details is undefined',
          lineData,
          ctx,
        );
      }
      const [rawPosition, rawName] = rawPokemon.split(':');
      const trainer = rawPosition.slice(0, 2) as 'p1' | 'p2';
      const nameOrNickname = rawName.trim();
      const { species } = this.handlerUtils.parsePokemonDetails(details);
      ctx.nicknameToPokemonMap[trainer][nameOrNickname] = species;
    },
    registerFormChange: (
      reason: string,
      lineData: (string | undefined)[],
      ctx: SSPPContext,
      options: { shouldIncludePlayer?: boolean } = {},
    ) => {
      const [_, rawPokemon, rawDetails, ...__] = lineData;
      if (!rawPokemon) {
        throw new CommandHandlerError('pokemon is undefined', lineData, ctx);
      }
      let species = 'unknown';
      if (rawDetails) {
        const { species: newSpecies } =
          this.handlerUtils.parsePokemonDetails(rawDetails);
        species = newSpecies;
      }
      const { player, taggedPokemon, pokemon } = this.handlerUtils.parsePokemon(
        rawPokemon,
        ctx,
      );
      this.handlerUtils.pushAction(
        {
          player: options.shouldIncludePlayer ? player : undefined,
          type: 'effect',
          name: reason,
          targets: [species],
          user: options.shouldIncludePlayer ? pokemon : taggedPokemon,
        },
        ctx,
      );
      this.handlerUtils.registerPokemon(lineData, ctx);
    },
    boostChange: (
      label: string,
      lineData: (string | undefined)[],
      ctx: SSPPContext,
    ) => {
      const [_, rawPokemon, stat, amount, ...rest] = lineData;
      if (!rawPokemon) {
        throw new CommandHandlerError('pokemon is undefined', lineData, ctx);
      }
      const fromAndOf = this.handlerUtils.parseRest(rest, ctx);
      const fromName = fromAndOf.from?.fromName;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: fromAndOf.inferredActionType,
          name: fromName
            ? `${fromName} caused ${stat} ${label} ${amount} to`
            : `${stat} ${label} ${amount}`,
          targets: fromName ? [taggedPokemon] : [],
          user: fromName ? (fromAndOf.of?.taggedPokemon ?? '') : taggedPokemon,
        },
        ctx,
      );
    },
    volatileEffect: (
      label: string,
      lineData: (string | undefined)[],
      ctx: SSPPContext,
    ) => {
      const [_, rawPokemon, effect, ...rest] = lineData;
      if (!rawPokemon) {
        throw new CommandHandlerError('pokemon is undefined', lineData, ctx);
      }
      const restData = this.handlerUtils.parseRest(rest, ctx);
      const fromName = restData.from?.fromName;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: restData.inferredActionType,
          name:
            (fromName ? `${fromName} caused ` : '') + `${effect} ${label} on`,
          targets: [taggedPokemon],
          user: restData.of?.taggedPokemon ?? '',
        },
        ctx,
      );
    },
    field: (
      label: string,
      lineData: (string | undefined)[],
      ctx: SSPPContext,
    ) => {
      const [_, condition, ...rest] = lineData;
      const restData = this.handlerUtils.parseRest(rest, ctx);
      const fromName = restData.from?.fromName;
      this.handlerUtils.pushAction(
        {
          type: restData.inferredActionType,
          name:
            (restData ? `${fromName} caused ` : '') + `${condition} ${label}`,
          user: restData.of?.taggedPokemon ?? '',
          targets: [],
        },
        ctx,
      );
    },
    side: (
      label: string,
      lineData: (string | undefined)[],
      ctx: SSPPContext,
    ) => {
      const [_, side, condition, ...rest] = lineData;
      const restData = this.handlerUtils.parseRest(rest, ctx);
      const fromName = restData.from?.fromName;
      this.handlerUtils.pushAction(
        {
          type: restData.inferredActionType,
          name:
            (fromName ? `${fromName} caused ` : '') +
            `${condition} ${label} for ${side}`,
          user: restData.of?.taggedPokemon ?? '',
          targets: [],
        },
        ctx,
      );
    },
    getTypeFrom: (data: RestData): Action['type'] => {
      return data.from?.type === 'ability' ? 'ability' : 'effect';
    },
  };

  commandHandlers: Record<string, CommandHandler> = {
    turn: (lineData, ctx) => {
      const [_, rawTurnIndex] = lineData;
      const turnIndex = Number(rawTurnIndex);
      if (turnIndex > 1) {
        this.handlerUtils.pushTurn(ctx);
      }
      ctx.currTurnIndex = turnIndex;
    },
    win: (lineData, ctx) => {
      const [_, winner] = lineData;
      if (!winner) {
        throw new CommandHandlerError('Winner is undefined', lineData, ctx);
      }
      const winnerPlayer = ctx.usernameToPlayerMap[winner];
      if (winnerPlayer === 'p1') {
        ctx.result = 'win';
      } else if (winnerPlayer === 'p2') {
        ctx.result = 'loose';
      }
      this.handlerUtils.pushTurn(ctx);
    },
    player: (lineData, ctx) => {
      const [_, player, username, ...__] = lineData;
      if (!username) {
        throw new CommandHandlerError('Username is undefined', lineData, ctx);
      }
      ctx.usernameToPlayerMap[username] = player as 'p1' | 'p2';
    },
    tie: (_lineData, ctx) => {
      ctx.result = 'tie';
    },
    move: (lineData, ctx) => {
      const [_, rawPokemon, move, rawTarget] = lineData;
      const { player, pokemon } = this.handlerUtils.parsePokemon(
        rawPokemon,
        ctx,
      );
      let target: string | undefined = undefined;
      if (rawTarget) {
        const { taggedPokemon: parsedTarget } = this.handlerUtils.parsePokemon(
          rawTarget,
          ctx,
        );
        target = parsedTarget;
      }
      this.handlerUtils.pushAction(
        {
          player,
          type: 'move',
          name: move ?? 'unknown',
          user: pokemon,
          targets: target ? [target] : [],
          flags: {
            isMissingTargets: !target,
          },
        },
        ctx,
      );
    },
    '-damage': (lineData, ctx) => {
      const [_, rawPokemon, _rawHp, ...rawFromAndOf] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      if (rawFromAndOf && rawFromAndOf.length) {
        const {
          from,
          of,
          inferredActionType: type,
        } = this.handlerUtils.parseRest(rawFromAndOf, ctx);
        const fromName = from?.fromName;
        this.handlerUtils.pushAction(
          {
            type,
            name: `${fromName ?? 'unknown'} inflicted damage to`,
            user: of?.taggedPokemon ?? '',
            targets: [taggedPokemon],
          },
          ctx,
        );
      } else {
        const lastMoveAction = this.handlerUtils.findLastMoveAction(ctx);
        if (lastMoveAction && lastMoveAction.flags?.isMissingTargets) {
          lastMoveAction.targets.push(taggedPokemon);
        }
      }
    },
    switch: this.handlerUtils.registerPokemon,
    drag: this.handlerUtils.registerPokemon,
    detailschange: (lineData, ctx) =>
      this.handlerUtils.registerFormChange('megaevolved to', lineData, ctx, {
        shouldIncludePlayer: true,
      }),
    '-formechange': (lineData, ctx) => {
      const [_, rawPokemon, species, ...rest] = lineData;
      const fromAndOf = this.handlerUtils.parseRest(rest, ctx);
      const name = fromAndOf.from?.fromName;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: fromAndOf.inferredActionType,
          name: name ?? 'changed its forme to',
          targets: [species ?? 'unknown'],
          user: taggedPokemon,
        },
        ctx,
      );
      this.handlerUtils.registerPokemon(lineData, ctx);
    },
    replace: (lineData, ctx) =>
      this.handlerUtils.registerFormChange('illusion ended', lineData, ctx),
    cant: (lineData, ctx) => {
      const [_, rawPokemon, reason, move] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: `cant not ${move} due to ${reason}`,
          targets: [],
          user: taggedPokemon,
        },
        ctx,
      );
    },
    faint: (lineData, ctx) => {
      const [_, rawPokemon] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: 'fainted',
          targets: [],
          user: taggedPokemon,
        },
        ctx,
      );
    },
    '-fail': (lineData, ctx) => {
      const [_, rawPokemon, action] = lineData;
      const { pokemon: target } = this.handlerUtils.parsePokemon(
        rawPokemon,
        ctx,
      );
      const { user = 'unknown' } = ctx.currActions.at(-1) ?? {};
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: `failed to ${action} against`,
          targets: [target],
          user,
        },
        ctx,
      );
    },
    '-block': (lineData, ctx) => {
      const [_, rawTarget, effect, move, rawAttacker] = lineData;
      const { taggedPokemon: attacker } = this.handlerUtils.parsePokemon(
        rawAttacker,
        ctx,
      );
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawTarget, ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: `${effect} blocked ${move} from`,
          targets: [attacker],
          user: taggedPokemon,
        },
        ctx,
      );
    },
    '-miss': (lineData, ctx) => {
      const [_, rawPokemon, rawTarget] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      const { taggedPokemon: target } = this.handlerUtils.parsePokemon(
        rawTarget,
        ctx,
      );
      const lastAction = ctx.currActions.at(-1);
      let move = 'unknown';
      if (lastAction && lastAction.type === 'move') {
        move = lastAction.name;
      }
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: `missed ${move} against`,
          targets: [target],
          user: taggedPokemon,
        },
        ctx,
      );
    },
    '-status': (lineData, ctx) => {
      const [_, rawPokemon, status, ...rest] = lineData;
      const fromAndOf = this.handlerUtils.parseRest(rest, ctx);
      const fromName = fromAndOf.from?.fromName;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: fromAndOf.inferredActionType,
          name: fromName
            ? `${fromName} inflicted ${status}`
            : `${status} affected`,
          targets: [taggedPokemon],
          user: fromAndOf.of?.taggedPokemon ?? '',
        },
        ctx,
      );
    },
    '-curestatus': (lineData, ctx) => {
      const [_, rawPokemon, status, ...rest] = lineData;
      const fromAndOf = this.handlerUtils.parseRest(rest, ctx);
      const fromName = fromAndOf.from?.fromName;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: fromAndOf.inferredActionType,
          name: fromName
            ? `${fromName} cured ${status}`
            : `recovered from ${status}`,
          targets: fromName ? [taggedPokemon] : [],
          user: fromName ? (fromAndOf.of?.taggedPokemon ?? '') : taggedPokemon,
        },
        ctx,
      );
    },
    '-boost': (lineData, ctx) =>
      this.handlerUtils.boostChange('increased by', lineData, ctx),
    '-unboost': (lineData, ctx) =>
      this.handlerUtils.boostChange('decreased by', lineData, ctx),
    '-setboost': (lineData, ctx) =>
      this.handlerUtils.boostChange('changed to', lineData, ctx),
    '-weather': (lineData, ctx) => {
      const [_, weather, ...rest] = lineData;
      const restData = this.handlerUtils.parseRest(rest, ctx);
      if (restData.upkeep) return;
      if (weather === 'none') {
        this.handlerUtils.pushAction(
          {
            type: 'effect',
            name: 'weather ended',
            user: '',
            targets: [],
          },
          ctx,
        );
        return;
      }
      const fromName = restData.from?.fromName;
      this.handlerUtils.pushAction(
        {
          type: restData.inferredActionType,
          name: (fromName ? `${fromName} set ` : '') + `weather ${weather}`,
          user: restData.of?.taggedPokemon ?? '',
          targets: [],
        },
        ctx,
      );
    },
    '-fieldstart': (lineData, ctx) =>
      this.handlerUtils.field('started', lineData, ctx),
    '-fieldend': (lineData, ctx) =>
      this.handlerUtils.field('ended', lineData, ctx),
    '-sidestart': (lineData, ctx) =>
      this.handlerUtils.side('started', lineData, ctx),
    '-sideend': (lineData, ctx) =>
      this.handlerUtils.side('ended', lineData, ctx),
    '-start': (lineData, ctx) =>
      this.handlerUtils.volatileEffect('started', lineData, ctx),
    '-end': (lineData, ctx) =>
      this.handlerUtils.volatileEffect('ended', lineData, ctx),
    '-crit': (lineData, ctx) => {
      const [_, rawPokemon] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      const lastMove = this.handlerUtils.findLastMoveAction(ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: 'critical hit',
          targets: [taggedPokemon],
          user: lastMove?.user ?? 'unknown',
        },
        ctx,
      );
    },
    '-ability': (lineData, ctx) => {
      const [_, rawPokemon, ability] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: ability ?? 'unknown',
          targets: [],
          user: taggedPokemon,
        },
        ctx,
      );
    },
    '-zpower': (lineData, ctx) => {
      const [_, rawPokemon] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: 'used Z move',
          targets: [],
          user: taggedPokemon,
        },
        ctx,
      );
    },
    '-activate': (lineData, ctx) => {
      const [_, rawEffect, ...rest] = lineData;
      const restData = this.handlerUtils.parseRest(rest, ctx);
      const fromName = restData.from?.fromName;
      const effect = rawEffect ?? 'unknown';
      this.handlerUtils.pushAction(
        {
          type: restData.inferredActionType,
          name: (fromName ? `${fromName} casued ` : '') + effect,
          targets: [],
          user: restData.of?.taggedPokemon ?? '',
        },
        ctx,
      );
    },
    '-hitcount': (lineData, ctx) => {
      const [_, rawPokemon, num] = lineData;
      const { taggedPokemon } = this.handlerUtils.parsePokemon(rawPokemon, ctx);
      this.handlerUtils.pushAction(
        {
          type: 'effect',
          name: `hit ${num} times`,
          targets: [],
          user: taggedPokemon,
        },
        ctx,
      );
    },
  };

  parse(metadata: BattleMetadata, data: string[]) {
    const { turns, result } = this.parseTurns(data);
    const battle: CreateBattleData = {
      ...metadata,
      turns,
      result,
    };
    return battle;
  }

  parseTurns(data: string[]) {
    const ctx: SSPPContext = {
      currTurnIndex: 0,
      turns: [],
      currActions: [],
      usernameToPlayerMap: {},
      nicknameToPokemonMap: {
        p1: {},
        p2: {},
      },
    };
    for (const line of data) {
      const [_, ...lineData] = line.split('|');
      const command = lineData[0];
      try {
        if (command in this.commandHandlers) {
          this.commandHandlers[command](lineData, ctx);
        }
      } catch (error) {
        console.warn('Failed to parse line', error);
      }
    }
    if (ctx.currActions.length) {
      console.warn('Some actions were not assigned');
    }
    return { turns: ctx.turns, result: ctx.result };
  }
}

class CommandHandlerError extends Error {
  lineData?: (string | undefined)[];
  ctx?: SSPPContext;

  constructor(
    message: string,
    lineData?: (string | undefined)[],
    ctx?: SSPPContext,
  ) {
    super(message);
    this.lineData = lineData;
    this.ctx = ctx;
  }
}
