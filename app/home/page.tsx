import { Flex } from 'antd';

import Welcome from '@/src/components/Welcome';

const Page = () => {
  return (
    <Flex className="h-full" justify="center" align="center">
      <Welcome />
    </Flex>
  );
};

export default Page;
