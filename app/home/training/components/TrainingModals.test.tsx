import { Training } from '@/src/types/api';
import { AddTrainingFormData, EditTrainingFormData } from '@/src/types/form';
import { itShouldContainFormItems } from '@/src/utils/jest';

import { AddOrEditTrainingModal } from './TrainingModals';

jest.mock('@razr/formdata', () => ({
  encode: jest.fn(),
}));

jest.mock('../actions', () => ({
  createTraining: jest.fn(),
  editTraining: jest.fn(),
}));

const createFormData: Required<AddTrainingFormData> = {
  season: 0,
  format: '',
  description: '',
  name: '',
  teamId: '',
};

const editFormData: Required<EditTrainingFormData> = {
  ...createFormData,
  id: '',
};

const training: Training = {
  id: '',
  description: '',
  isDefault: false,
  name: '',
  battles: [],
  createdAt: '',
};

const EditComponent = () => {
  return (
    <AddOrEditTrainingModal
      isOpen={true}
      closeModal={() => {}}
      teams={[]}
      training={training}
    />
  );
};

const CreateComponent = () => {
  return (
    <AddOrEditTrainingModal isOpen={true} closeModal={() => {}} teams={[]} />
  );
};

describe('TrainingModals', () => {
  describe('EditTrainingModal', () => {
    itShouldContainFormItems({
      formData: editFormData,
      formName: 'editTraining',
      component: <EditComponent />,
    });
  });

  describe('AddTrainingModal', () => {
    itShouldContainFormItems({
      formData: createFormData,
      formName: 'createTraining',
      component: <CreateComponent />,
    });
  });
});
