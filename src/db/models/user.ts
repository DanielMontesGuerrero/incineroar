import { hash } from 'bcrypt';
import { Model, models, Schema } from 'mongoose';

import { SignUpData, User } from '@/src/types/api';

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
      username: user.username,
    });
    if (sameUsernameCount) {
      throw new UserAlreadyExistsError(user);
    }
    user.password = await hash(user.password, UserRepository.HASH_SALTS);
    return await this.model.create(user);
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
