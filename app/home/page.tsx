'use client';

import Welcome from '@/src/components/Welcome';
import useUserQuery from '@/src/hooks/useUserQuery';

const Page = () => {
  const { data } = useUserQuery();
  console.log({ data });
  return <Welcome />;
};

export default Page;
