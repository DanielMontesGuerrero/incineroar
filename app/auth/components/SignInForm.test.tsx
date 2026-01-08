import { SignInData } from '@/src/types/api';
import { itShouldContainFormItems } from '@/src/utils/jest';

import SignInForm from './SignInForm';

jest.mock('@razr/formdata', () => ({
  encode: jest.fn(),
}));

jest.mock('../actions', () => ({
  signIn: jest.fn(),
}));

const Component = () => {
  return <SignInForm onSignUp={() => {}} />;
};

describe('SignInForm', () => {
  const formData: SignInData = {
    username: '',
    password: '',
  };

  itShouldContainFormItems({
    formData,
    formName: 'signin',
    component: <Component />,
  });
});
