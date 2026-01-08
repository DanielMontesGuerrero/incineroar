import { SignUpData } from '@/src/types/api';
import { itShouldContainFormItems } from '@/src/utils/jest';

import SignUpForm from './SignUpForm';

jest.mock('@razr/formdata', () => ({
  encode: jest.fn(),
}));

jest.mock('../actions', () => ({
  signIn: jest.fn(),
}));

const Component = () => {
  return <SignUpForm onSignIn={() => {}} />;
};

describe('SignUpForm', () => {
  const formData: SignUpData = {
    username: '',
    password: '',
  };

  itShouldContainFormItems({
    formData,
    formName: 'signup',
    component: <Component />,
  });
});
