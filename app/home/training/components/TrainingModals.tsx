'use client';

import { PlusCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Select, SelectProps } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import TextArea from 'antd/es/input/TextArea';
import Compact from 'antd/es/space/Compact';
import { useEffect, useState } from 'react';

import { TrainingKeys } from '@/src/constants/query-keys';
import useFormAction, { getValidateStatus } from '@/src/hooks/useFormAction';
import useUserQuery from '@/src/hooks/useUserQuery';
import { Team } from '@/src/types/api';
import { AddTrainingFormData } from '@/src/types/form';
import { queryClient } from '@/src/utils/query-clients';

import { AddTrainingActionState, createTraining } from '../actions';

const TrainingForm = Form<AddTrainingFormData>;
const TrainingFormItem = FormItem<AddTrainingFormData>;

const INITIAL_STATE: AddTrainingActionState = {
  success: false,
  data: {
    name: '',
    teamId: undefined,
    season: undefined,
    format: undefined,
    description: '',
  },
};

interface AddTrainingModalProps {
  isOpen: boolean;
  closeModal: () => void;
  teams: Team[];
  isLoading?: boolean;
}

const AddTrainingModal = ({
  isOpen,
  closeModal,
  teams,
  isLoading,
}: AddTrainingModalProps) => {
  const { state, form, onFinish, isPending } =
    useFormAction<AddTrainingFormData>(INITIAL_STATE, createTraining);
  const yearValues = Array.from(
    { length: new Date().getFullYear() - 2008 + 2 },
    (_, i) => 2008 + i,
  )
    .map((year) => ({ value: year.toString() }))
    .reverse();
  const teamsItems: SelectProps['options'] = teams.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  useEffect(() => {
    if (state.success) {
      closeModal();
      form.resetFields();
      queryClient
        .invalidateQueries({ queryKey: TrainingKeys.trainings() })
        .catch((reason) => console.warn('Failed to invalidate query', reason));
    }
  }, [state.success, closeModal, form]);

  return (
    <Modal
      title="Add training"
      open={isOpen}
      onCancel={closeModal}
      loading={isLoading}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]}
    >
      <TrainingForm
        name="createTraining"
        form={form}
        initialValues={state.success ? INITIAL_STATE : state.data}
        labelCol={{ span: 4 }}
        onFinish={onFinish}
      >
        {'error' in state && (
          <FormItem>
            <Alert message={state.error} type="error" />
          </FormItem>
        )}
        <TrainingFormItem
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
          validateStatus={getValidateStatus(state, 'name', isPending)}
        >
          <Input />
        </TrainingFormItem>
        <TrainingFormItem
          name="format"
          label="Format"
          validateStatus={getValidateStatus(state, 'format', isPending)}
        >
          <Compact block>
            <TrainingFormItem name="season" noStyle>
              <Select options={[{ value: undefined }, ...yearValues]} />
            </TrainingFormItem>
            <Input />
          </Compact>
        </TrainingFormItem>
        <TrainingFormItem name="teamId" label="Team">
          <Select options={teamsItems} />
        </TrainingFormItem>
        <TrainingFormItem
          name="description"
          label="Description"
          validateStatus={getValidateStatus(state, 'description', isPending)}
        >
          <TextArea autoSize={{ minRows: 4, maxRows: 12 }} />
        </TrainingFormItem>
      </TrainingForm>
    </Modal>
  );
};

const AddTraining = () => {
  const { isLoading, data } = useUserQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Add training
      </Button>
      {isModalOpen && (
        <AddTrainingModal
          teams={data?.teams || []}
          isLoading={isLoading}
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default AddTraining;
