import { compare, hash } from 'bcrypt';
import { Model, models, Schema } from 'mongoose';

import {
  SignInData,
  SignUpData,
  UnsensitiveUserData,
  User,
} from '@/src/types/api';

import DBConnection from '../DBConnection';
import { BaseRepository } from '../repository';

const UserSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    toJSON: { virtuals: true },
  },
);

export default class UserRepository implements BaseRepository<User> {
  static HASH_SALTS = 5;
  protected model: Model<User>;

  constructor() {
    this.model =
      (models.User as Model<User>) ||
      DBConnection.getConnection().model('User', UserSchema);
  }

  async getById(id: string) {
    const user = await this.model.findById(id).lean();
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  async create(user: SignUpData) {
    const sameUsernameCount = await this.model.countDocuments({
      username: new RegExp(user.username, 'i'),
    });
    if (sameUsernameCount) {
      throw new UserAlreadyExistsError(user);
    }
    user.password = await hash(user.password, UserRepository.HASH_SALTS);
    return await this.model.create(user);
  }

  async exists({
    username,
    password,
  }: SignInData): Promise<UnsensitiveUserData | undefined> {
    const user = await this.model.findOne({
      username: new RegExp(username, 'i'),
    });
    if (!user) {
      return undefined;
    }
    const isSamePassword = await compare(password, user.password);
    if (!isSamePassword) {
      return undefined;
    }

    return { username, id: user.id as string };
  }
}

export class UserNotFoundError extends Error {
  id: string;
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.id = id;
  }
}

export class UserAlreadyExistsError extends Error {
  user: SignUpData;
  constructor(user: SignUpData) {
    super(`User with username: ${user.username} already exists`);
    this.user = user;
  }
}
