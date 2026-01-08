import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

import { UserKeys } from '../constants/query-keys';
import { GET_ME } from '../types/endpoints';

const getUser = async () => {
  const result = await axios.get<GET_ME>('/api/user/me');
  return result.data.user;
};

const useUserQuery = () => {
  return useSuspenseQuery({
    queryKey: UserKeys.me(),
    queryFn: getUser,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export default useUserQuery;
