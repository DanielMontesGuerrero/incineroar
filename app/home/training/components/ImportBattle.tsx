import { InboxOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Modal, Select } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import FormItem from 'antd/es/form/FormItem';
import Dragger, { DraggerProps } from 'antd/es/upload/Dragger';
import { useEffect, useMemo, useState } from 'react';

import { TrainingKeys } from '@/src/constants/query-keys';
import useFormAction, { getValidateStatus } from '@/src/hooks/useFormAction';
import { Training } from '@/src/types/api';
import { BattleDataSource, ImportBattlesFormData } from '@/src/types/form';
import { readFile } from '@/src/utils/file';
import { queryClient } from '@/src/utils/query-clients';

import { importBattles, ImportBattlesFormActionState } from '../actions';

const ImportForm = Form<ImportBattlesFormData>;
const ImportFormItem = FormItem<ImportBattlesFormData>;

const INITIAL_STATE: ImportBattlesFormActionState = {
  success: false,
  data: {
    trainingId: '',
    source: 'showdown-sim-protocol',
    battles: [],
  },
};

interface ImportBattlesModalProps {
  isOpen: boolean;
  closeModal: () => void;
  training: Training;
}

interface DataSource {
  label: string;
  value: BattleDataSource;
}

const parseFile = (content: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const elements = doc.getElementsByClassName('battle-log-data');
  return elements[0].innerHTML ?? '';
};

const ImportBattlesModal = ({
  closeModal,
  isOpen,
  training,
}: ImportBattlesModalProps) => {
  const { state, form, onFinish, isPending } =
    useFormAction<ImportBattlesFormData>(INITIAL_STATE, importBattles);
  const [files, setFiles] = useState<DraggerProps['fileList']>([]);
  const source = useWatch('source', form);
  const sources = [
    {
      label: 'Showdown',
      value: 'showdown-sim-protocol',
    },
  ] satisfies ReadonlyArray<DataSource>;
  const acceptedFileExtension = useMemo(() => {
    switch (source) {
      case 'showdown-sim-protocol':
        return '.html';
      default:
        return '';
    }
  }, [source]);
  const intertecptOnFinish = async (data: ImportBattlesFormData) => {
    const battles = await Promise.all(
      (files ?? []).map(async (file) => {
        if (!file.originFileObj) {
          console.warn('Missing origin file data');
          return { name: '', data: '' };
        }
        const data = parseFile(await readFile(file.originFileObj));
        return {
          name: file.name.replace('.html', ''),
          data,
        };
      }),
    );
    onFinish({
      ...data,
      trainingId: training.id,
      battles,
    });
  };

  useEffect(() => {
    if (state.success) {
      closeModal();
      form.resetFields();
      const trainingId = training.id;
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TrainingKeys.trainings() }),
        trainingId
          ? queryClient.invalidateQueries({
              queryKey: TrainingKeys.training(trainingId),
            })
          : Promise.resolve(),
      ]).catch((reason) => console.warn('Failed to invalidate query', reason));
    }
  }, [state.success, closeModal, form, training]);

  return (
    <Modal
      title="Import battles"
      open={isOpen}
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Import
        </Button>,
      ]}
    >
      <ImportForm
        name="importBattles"
        form={form}
        initialValues={state}
        labelCol={{ span: 4 }}
        onFinish={(d) => void intertecptOnFinish(d)}
      >
        {'error' in state && (
          <FormItem>
            <Alert message={state.error} type="error" />
          </FormItem>
        )}
        <ImportFormItem
          name="source"
          label="Source"
          validateStatus={getValidateStatus(state, 'source', isPending)}
        >
          <Select options={sources} />
        </ImportFormItem>
        <Dragger
          multiple
          accept={acceptedFileExtension}
          beforeUpload={() => false}
          fileList={files}
          onChange={(info) => setFiles(info.fileList)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag files to this area to upload
          </p>
        </Dragger>
      </ImportForm>
    </Modal>
  );
};

interface ImportBattlesProps {
  training: Training;
}

const ImportBattles = ({ training }: ImportBattlesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Import battle
      </Button>
      {isModalOpen && (
        <ImportBattlesModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          training={training}
        />
      )}
    </>
  );
};

export default ImportBattles;
