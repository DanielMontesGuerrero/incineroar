export interface SignUpData {
  username: string;
  password: string;
}

export type SignInData = Pick<SignUpData, 'username' | 'password'>;
