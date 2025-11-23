import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { UserKeys } from '../constants/query-keys';
import { queryClient } from '../utils/query-client';

const deleteTeam = async (teamId: string) => {
  return await axios.delete(`/api/team/${teamId}`);
};

export const useDeleteTeamMutation = (teamId: string) => {
  return useMutation({
    mutationFn: () => deleteTeam(teamId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: UserKeys.me() });
    },
  });
};
