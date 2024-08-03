import React, { useState } from 'react';

import {
  Column,
  Grid,
  TableRow,
  TableCell,
  TableToolbarMenu,
  TableToolbarAction,
} from '@carbon/react';

import { gql, useQuery } from '@apollo/client';

import useAuth from '../../hooks/useAuth';

import DataTable from '../../components/DataTable/DataTable.jsx';
import Time from '../../common/Time.jsx';
import UserMenu from './UserMenu.jsx';
import NewUser from './NewUser.jsx';

const USERS = gql`query users($showDeleted:Boolean) {
  users(showDeleted:$showDeleted) {
    id
    realname
    username
    role
    lastLogin
    deletedAt
  }
  roles
}`;

const Users = function Users() {
  const [showDeleted, setShowDeleted] = useState(false);
  const {
    loading, error, data, refetch,
  } = useQuery(USERS, {
    variables: { showDeleted },
  });

  const { auth } = useAuth();

  const headers = ['Real Name', 'Username', 'Role', 'Last Login', 'Actions'];

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <DataTable
          title="Users"
          description="User accounts allow you to restrict and manage access to rtr"
          emptyTitle="There are no Users yet."
          emptyDescription="To get started, click New User."
          emptyAction={<NewUser refresh={refetch} roles={data?.roles} />}
          headers={headers}
          data={data?.users}
          toolbarItems={(
            <>
              <TableToolbarMenu>
                <TableToolbarAction onClick={() => setShowDeleted(!showDeleted)}>
                  {showDeleted ? 'Hide' : 'Show'}
                  {' '}
                  Deactivated
                </TableToolbarAction>
                <TableToolbarAction onClick={() => refetch()}>
                  Refresh
                </TableToolbarAction>
              </TableToolbarMenu>
              <NewUser refresh={refetch} roles={data?.roles} />
            </>
          )}
          renderRow={(row) => (
            <TableRow key={row.username}>
              <TableCell>{row.realname}</TableCell>
              <TableCell>
                {row.username}
                {' '}
                {row.username === auth.user && '(You)'}
              </TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.deletedAt !== 0 ? <em>Deactivated</em> : <Time time={row.lastLogin} since />}</TableCell>
              <TableCell>
                <UserMenu refresh={refetch} user={row} roles={data?.roles} />
              </TableCell>
            </TableRow>
          )}
          loading={loading}
          error={error}
          refresh={refetch}
        />
      </Column>
    </Grid>
  );
};

export default Users;
