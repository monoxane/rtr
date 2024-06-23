import React, { useState } from 'react';

import {
  Column,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  DataTableSkeleton,
} from '@carbon/react';

import Time from '../../common/Time.jsx';
import NewUser from './NewUser.jsx';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import useAuth from '../../hooks/useAuth';

import UserMenu from './UserMenu.jsx';

const Users = function Users() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [{ data, loading, error }, refresh] = useAxiosPrivate()(
    `/v1/api/users${showDeleted ? '?show_deleted=true' : ''}`,
  );

  const [roles] = useAxiosPrivate()(
    '/v1/api/user_roles',
  );

  const { auth } = useAuth();

  const headers = ['Username', 'Real Name', 'Role', 'Last Login', 'Actions'];

  return (
    <Grid>
      {loading && !data
        && (
          <Column sm={4} lg={16}>
            <DataTableSkeleton headers={headers} aria-label="users-table" />
          </Column>
        )}
      {error && 'Error'}
      {data
        && (
        <Column sm={4} md={8} lg={16}>
          <TableContainer title="Users">
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch onChange={() => {}} placeholder="Search for a User" />
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
            <Table size="md" useZebraStyles={false}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader id={header.key} key={header}>
                      {header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0
                && (
                <TableRow>
                  <TableCell>There are no Users, click the Add button to create one</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
                )}
                {data?.map((row) => row != null && (
                <TableRow key={row.username}>
                  <TableCell>
                    {row.username}
                    {' '}
                    {row.username === auth.user && '(You)'}
                  </TableCell>
                  <TableCell>{row.real_name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.deleted_at ? <em>Deactivated</em> : <Time time={row.last_login} since />}</TableCell>
                  <TableCell>
                    <UserMenu refresh={refresh} user={row} roles={roles} />
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Column>
        )}
    </Grid>
  );
};

export default Users;
