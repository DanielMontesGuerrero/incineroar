import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import TextArea from 'antd/es/input/TextArea';
import Compact from 'antd/es/space/Compact';
import { useEffect, useState } from 'react';

import { UserKeys } from '@/src/constants/query-keys';
import useFormAction, { getValidateStatus } from '@/src/hooks/useFormAction';
import { CreateTeamData } from '@/src/types/api';
import { queryClient } from '@/src/utils/query-client';

import { createTeam, CreateTeamActionState } from '../actions';

const TeamFormItem = FormItem<CreateTeamData>;

const INITIAL_STATE: CreateTeamActionState = {
  success: false,
  data: {
    name: '',
    description: '',
    season: new Date().getFullYear(),
    regulation: '',
    tags: [],
    data: '',
  },
};

interface TeamFormModalProps {
  closeModal: () => void;
  isOpen: boolean;
}

const TeamFormModal = ({ closeModal, isOpen }: TeamFormModalProps) => {
  const { state, form, onFinish, isPending } = useFormAction<CreateTeamData>(
    INITIAL_STATE,
    createTeam,
  );
  const initialValues = state.success ? INITIAL_STATE.data : state.data;
  const yearValues = Array.from(
    { length: new Date().getFullYear() - 2008 + 2 },
    (_, i) => 2008 + i,
  )
    .map((year) => ({ value: year.toString() }))
    .reverse();

  useEffect(() => {
    if (state.success) {
      closeModal();
      form.resetFields();
      queryClient
        .invalidateQueries({ queryKey: UserKeys.me() })
        .catch(() => console.error('Failed to invalidate user query'));
    }
  }, [state.success, closeModal, form]);

  return (
    <Modal
      title="Import new team"
      open={isOpen}
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]}
    >
      <Form
        name="createTeam"
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
        labelCol={{ span: 5 }}
      >
        <TeamFormItem
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a team name' }]}
          validateStatus={getValidateStatus(state, 'name', isPending)}
        >
          <Input />
        </TeamFormItem>
        <TeamFormItem
          name="description"
          label="Description"
          validateStatus={getValidateStatus(state, 'description', isPending)}
        >
          <TextArea autoSize />
        </TeamFormItem>
        <TeamFormItem
          name="regulation"
          label="Regulation"
          rules={[{ required: true, message: 'Please enter the regulation' }]}
          validateStatus={getValidateStatus(state, 'regulation', isPending)}
        >
          <Compact block>
            <TeamFormItem name="season" noStyle>
              <Select options={yearValues} />
            </TeamFormItem>
            <Input />
          </Compact>
        </TeamFormItem>
        <TeamFormItem
          name="tags"
          label="Tags"
          validateStatus={getValidateStatus(state, 'tags', isPending)}
        >
          <Select className="w-full" mode="tags" placeholder="Enter tags" />
        </TeamFormItem>
        <TeamFormItem
          name="data"
          label="Data"
          rules={[{ required: true, message: 'Please enter the team data' }]}
          validateStatus={getValidateStatus(state, 'data', isPending)}
        >
          <TextArea autoSize={{ minRows: 4, maxRows: 12 }} />
        </TeamFormItem>
      </Form>
    </Modal>
  );
};

export const ImportTeamModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Import team
      </Button>
      <TeamFormModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />
    </>
  );
};
