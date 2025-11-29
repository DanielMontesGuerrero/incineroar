import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';

import Welcome from '@/src/components/Welcome';

const Home = () => {
  return (
    <Layout>
      <Content className="h-dvh bg-black">
        <Welcome showEnter />
      </Content>
    </Layout>
  );
};

export default Home;
