import useFormAction from '@/src/hooks/useFormAction';
import { CreateTeamData, UpdateTeamData } from '@/src/types/api';
import { itShouldContainFormItems } from '@/src/utils/jest';

import { CreateTeamActionState, UpdateTeamActionState } from '../actions';
import { TeamForm } from './TeamModals';

jest.mock('@razr/formdata', () => ({
  encode: jest.fn(),
}));

jest.mock('../actions', () => ({
  updateTeam: jest.fn(),
  createTeam: jest.fn(),
}));

const createFormData: CreateTeamData = {
  name: '',
  description: '',
  season: 0,
  format: '',
  tags: [],
  data: '',
};

const editFormData: UpdateTeamData = {
  id: '',
  name: '',
  description: '',
  season: 0,
  format: '',
  tags: [],
  data: '',
};

const EditComponent = () => {
  const initialState: UpdateTeamActionState = {
    success: false,
    data: editFormData,
  };
  const Form = TeamForm<UpdateTeamData>;
  const { form, onFinish, state, isPending } = useFormAction(
    initialState,
    jest.fn(),
  );
  return (
    <Form
      initialValues={initialState.data}
      form={form}
      state={state}
      isPending={isPending}
      onFinish={onFinish}
      isEdit
    />
  );
};

const CreateComponent = () => {
  const initialState: CreateTeamActionState = {
    success: false,
    data: createFormData,
  };
  const Form = TeamForm<CreateTeamData>;
  const { form, onFinish, state, isPending } = useFormAction(
    initialState,
    jest.fn(),
  );
  return (
    <Form
      initialValues={initialState.data}
      form={form}
      state={state}
      isPending={isPending}
      onFinish={onFinish}
      isEdit
    />
  );
};

describe('TeamModals', () => {
  describe('TeamForm - edit', () => {
    itShouldContainFormItems({
      formData: editFormData,
      formName: 'editTeam',
      component: <EditComponent />,
    });
  });

  describe('TeamForm - create', () => {
    itShouldContainFormItems({
      formData: createFormData,
      formName: 'editTeam',
      component: <CreateComponent />,
    });
  });
});
