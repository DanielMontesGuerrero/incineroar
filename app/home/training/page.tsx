import { Col, Row } from 'antd';

import AddTraining from './components/TrainingModals';

const Page = () => {
  return (
    <>
      <Row className="mb-3">
        <AddTraining />
      </Row>
      <Row>
        <Col span={24}></Col>
      </Row>
    </>
  );
};

export default Page;
