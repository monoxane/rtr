import React, { useState } from 'react';

import {
  Column,
  Grid,
  TableRow,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
} from '@carbon/react';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';

import DataTable from '../../components/DataTable/DataTable.jsx';
import Time from '../../common/Time.jsx';
import UserMenu from './UserMenu.jsx';
import NewUser from './NewUser.jsx';

const Users = function Users() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [{ data, loading, error }, refresh] = useAxiosPrivate()(
    `/v1/api/users${showDeleted ? '?show_deleted=true' : ''}`,
  );

  const [roles] = useAxiosPrivate()(
    '/v1/api/user_roles',
  );

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
          emptyAction={<NewUser refresh={refresh} roles={roles} />}
          headers={headers}
          data={data}
          renderToolbar={({ searchQuery, setSearchQuery }) => (
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch onChange={(e) => { setSearchQuery(e.target.value); }} value={searchQuery} placeholder="Filter" />
                <TableToolbarMenu>
                  <TableToolbarAction onClick={() => setShowDeleted(!showDeleted)}>
                    {showDeleted ? 'Hide' : 'Show'}
                    {' '}
                    Deactivated
                  </TableToolbarAction>
                  <TableToolbarAction onClick={() => refresh()}>
                    Refresh
                  </TableToolbarAction>
                </TableToolbarMenu>
                <NewUser refresh={refresh} roles={roles} />
              </TableToolbarContent>
            </TableToolbar>
          )}
          renderRow={(row) => (
            <TableRow key={row.username}>
              <TableCell>{row.real_name}</TableCell>
              <TableCell>
                {row.username}
                {' '}
                {row.username === auth.user && '(You)'}
              </TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.deleted_at ? <em>Deactivated</em> : <Time time={row.last_login} since />}</TableCell>
              <TableCell>
                <UserMenu refresh={refresh} user={row} roles={roles} />
              </TableCell>
            </TableRow>
          )}
          loading={loading}
          error={error}
          refresh={refresh}
        />
      </Column>
    </Grid>
  );
};

export default Users;
