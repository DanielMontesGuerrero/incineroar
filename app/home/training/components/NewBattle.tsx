import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import { useRouter } from 'next/navigation';

import { TrainingKeys } from '@/src/constants/query-keys';
import { queryClient } from '@/src/utils/query-clients';

import { createBattle } from '../actions';

interface NewBattleProps {
  trainingId?: string;
  onError?: (message: string) => void;
  type?: ButtonProps['type'];
}

const NewBattle = ({ trainingId, onError, ...props }: NewBattleProps) => {
  const router = useRouter();
  const onNewBattle = async () => {
    if (!trainingId) return;
    const battle = await createBattle(trainingId);
    if (!battle) {
      onError?.('Could not create new battle. Try again');
    }
    await queryClient.invalidateQueries({
      queryKey: TrainingKeys.training(trainingId),
    });
    await queryClient.invalidateQueries({
      queryKey: TrainingKeys.trainings(),
    });
    router.push(`/home/training/${trainingId}/${battle?.id}?edit=true`);
  };

  if (!trainingId) {
    return null;
  }

  return (
    <Button
      type={props.type ?? 'primary'}
      icon={<PlusCircleOutlined />}
      onClick={() => void onNewBattle()}
    >
      New battle
    </Button>
  );
};

export default NewBattle;
