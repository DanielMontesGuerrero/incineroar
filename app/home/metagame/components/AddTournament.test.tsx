import { AddTournamentFormData } from '@/src/types/form';
import { itShouldContainFormItems } from '@/src/utils/jest';

import { AddTournamentModal } from './AddTournament';

jest.mock('@razr/formdata', () => ({
  encode: jest.fn(),
}));

jest.mock('../actions', () => ({
  createTournament: jest.fn(),
}));

const Component = () => {
  return <AddTournamentModal isOpen={true} closeModal={() => {}} />;
};

describe('SignInForm', () => {
  const formData: AddTournamentFormData = {
    name: '',
    season: 0,
    format: '',
    source: 'pokedata',
    data: '',
  };

  itShouldContainFormItems({
    formData,
    formName: 'createTournament',
    component: <Component />,
  });
});
