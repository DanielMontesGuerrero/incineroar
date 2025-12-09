'use client';

import { Col, Row } from 'antd';
import { use } from 'react';

import { useTrainingQuery } from '@/src/hooks/training-queries';

import TrainingsOrBattlesTable from '../components/TrainingsOrBattlesTable';

const Page = ({ params }: { params: Promise<{ trainingId: string }> }) => {
  const { trainingId } = use(params);
  const { isLoading, isError, data } = useTrainingQuery(trainingId);

  if (isError) {
    return <h1>Error</h1>;
  }

  return (
    <>
      <Row className="mb-3"></Row>
      <Row>
        <Col span={24}>
          <TrainingsOrBattlesTable
            isLoading={isLoading}
            trainingsAndBattles={data?.training.battles ?? []}
            onEditTraining={() => {}}
            training={data?.training}
          />
        </Col>
      </Row>
    </>
  );
};

export default Page;
