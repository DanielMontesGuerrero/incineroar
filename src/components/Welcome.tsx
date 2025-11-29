import { Flex, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import Image from 'next/image';
import Link from 'next/link';

import foLabsLogo from '@/public/fo-labs.svg';

interface WelcomeProps {
  showEnter?: boolean;
}

const Welcome = ({ showEnter }: WelcomeProps) => {
  return (
    <Flex vertical justify="center" align="center" className="h-full">
      <Image src={foLabsLogo as string} alt="fakeout labs" width={300} />
      <Title style={{ color: 'white' }}>FakeOut Labs</Title>
      <Typography style={{ color: 'white' }}>
        Tools for pokemon battling
      </Typography>
      {showEnter && <Link href="/auth">Enter</Link>}
    </Flex>
  );
};

export default Welcome;
