import { Training } from '@/src/types/api';
import { ImportBattlesFormData } from '@/src/types/form';
import { itShouldContainFormItems } from '@/src/utils/jest';

import { ImportBattlesModal } from './ImportBattle';

jest.mock('@razr/formdata', () => ({
  encode: jest.fn(),
}));

jest.mock('../actions', () => ({
  importBattles: jest.fn(),
}));

const training: Training = {
  id: '',
  name: '',
  createdAt: '',
  description: '',
  isDefault: false,
  battles: [],
};

const Component = () => {
  return (
    <ImportBattlesModal
      isOpen={true}
      closeModal={() => {}}
      training={training}
    />
  );
};

describe('ImportBattle', () => {
  const formData: ImportBattlesFormData = {
    source: 'showdown-sim-protocol',
    trainingId: '',
    battles: [],
  };

  itShouldContainFormItems({
    formData,
    formName: 'importBattles',
    component: <Component />,
  });
});
