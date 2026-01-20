'use client';

import { Alert, Col, Flex, Row } from 'antd';
import { useMemo, useState } from 'react';

import { useTrainigsQuery } from '@/src/hooks/training-queries';
import { Training } from '@/src/types/api';

import NewBattle from './components/NewBattle';
import AddTraining, { EditTrainingModal } from './components/TrainingModals';
import TrainingsOrBattlesTable from './components/TrainingsOrBattlesTable';

const Page = () => {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  );
  const { isLoading, data } = useTrainigsQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const defaultTraining = data?.trainings.find(({ isDefault }) => isDefault);
  const trainingsAndBattles = useMemo(() => {
    const trainings = data?.trainings ?? [];
    const battles = defaultTraining?.battles ?? [];
    const trainingsAndBattles = [
      ...battles,
      ...trainings.filter(({ isDefault }) => !isDefault),
    ];
    trainingsAndBattles.sort(({ createdAt: a }, { createdAt: b }) =>
      b.localeCompare(a),
    );
    return trainingsAndBattles.map((t) => ({
      key: t.id,
      ...t,
    }));
  }, [data, defaultTraining]);
  const fallbackDefaultTraining: Training = {
    id: '0',
    name: '',
    isDefault: true,
    createdAt: '',
    battles: [],
    description: '',
  };

  return (
    <>
      {errorMessage && (
        <Row>
          <Alert type="error" message={errorMessage} />
        </Row>
      )}
      <Row className="mb-3">
        <Flex gap={3}>
          <AddTraining />
          {defaultTraining && (
            <NewBattle
              type="default"
              trainingId={defaultTraining.id}
              onError={setErrorMessage}
            />
          )}
        </Flex>
      </Row>
      <Row>
        <Col span={24}>
          <TrainingsOrBattlesTable
            isLoading={isLoading}
            trainingsAndBattles={trainingsAndBattles}
            onEditTraining={setSelectedTraining}
            training={defaultTraining ?? fallbackDefaultTraining}
          />
        </Col>
      </Row>
      <EditTrainingModal
        isOpen={!!setSelectedTraining}
        closeModal={() => setSelectedTraining(null)}
        training={selectedTraining}
      />
    </>
  );
};

export default Page;
