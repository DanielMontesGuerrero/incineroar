'use client';

import { MoreOutlined } from '@ant-design/icons';
import { Button, Col, Dropdown, Row, Table, TableProps } from 'antd';
import Link from 'next/link';
import { useMemo } from 'react';

import { useDeleteTeamMutation } from '@/src/hooks/team-mutations';
import useUserQuery from '@/src/hooks/useUserQuery';
import { Team } from '@/src/types/api';

import { ImportTeamModal } from './components/TeamModals';
import TeamPreview from './components/TeamPreview';

const TeamsTable = Table<Team>;

interface ActionsMenuProps {
  teamId: string;
}

const ActionsMenu = ({ teamId }: ActionsMenuProps) => {
  const { mutate } = useDeleteTeamMutation(teamId);
  return (
    <Dropdown
      menu={{
        items: [
          { label: 'Edit', key: 'edit' },
          { label: 'Delete', key: 'delete', onClick: () => mutate() },
        ],
      }}
    >
      <Button shape="circle" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

const COLUMNS: TableProps<Team>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name, { id }) => <Link href={`/home/teams/${id}`}>{name}</Link>,
  },
  {
    title: 'Season',
    dataIndex: 'season',
    key: 'season',
  },
  {
    title: 'Regulation',
    dataIndex: 'regulation',
    key: 'regulation',
  },
  {
    title: 'Preview',
    dataIndex: 'parsedTeam',
    key: 'preview',
    render: (team: Team['parsedTeam']) => <TeamPreview team={team} />,
  },
  {
    title: 'Actions',
    key: 'acions',
    render: (_, { id }) => <ActionsMenu teamId={id} />,
  },
];

const Page = () => {
  const { isLoading, isError, data } = useUserQuery();
  const teams = useMemo(() => {
    return (data?.teams ?? []).map((team) => {
      const parsedTeam = {
        key: team.id,
        ...team,
      };
      return parsedTeam;
    });
  }, [data]);

  if (isError) {
    return <h1>Error</h1>;
  }

  return (
    <>
      <Row className="mb-3">
        <Col>
          <ImportTeamModal />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <TeamsTable
            loading={isLoading}
            columns={COLUMNS}
            dataSource={teams}
          />
        </Col>
      </Row>
    </>
  );
};

export default Page;
