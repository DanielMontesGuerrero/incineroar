export interface User {
  id: string;
  username: string;
  password: string;
}

export type SignUpData = Pick<User, 'username' | 'password'>;

export type SignInData = Pick<SignUpData, 'username' | 'password'>;

export type UnsensitiveUserData = Pick<User, 'username' | 'id'>;
