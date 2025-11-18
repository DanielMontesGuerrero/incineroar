import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { UserKeys } from '../constants/query-keys';
import { UnsensitiveUserData } from '../types/api';

const getUser = async (): Promise<UnsensitiveUserData> => {
  const result = await axios.get<{ user: UnsensitiveUserData }>('/api/user/me');
  return result.data.user;
};

const useUserQuery = () => {
  return useQuery({
    queryKey: UserKeys.me(),
    queryFn: getUser,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export default useUserQuery;
