import React from 'react';

import {
  Column,
  Grid,
  TableRow,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
} from '@carbon/react';

import {
  Renew,
  CheckmarkOutline,
  MisuseOutline,
} from '@carbon/icons-react';

import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import DataTable from '../../components/DataTable/DataTable.jsx';
// import Boolean from '../../common/Boolean.jsx';

import NewStream from './Modals/NewStream.jsx';
import StreamMenu from './Menus/StreamsDataTableActionMenu.jsx';

const Streams = function Streams() {
  const [{ data, loading, error }, refresh] = useAxiosPrivate()(
    '/v1/api/streams',
  );

  const headers = ['Name', 'Slug', 'Active', 'Clients', 'Destination', 'Is Routable', 'Actions'];

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <DataTable
          title="Streams"
          description="Streams are real-time audio and video signals visible from within rtr"
          emptyTitle="There are no Streams yet."
          emptyDescription="To get started, click New Stream."
          emptyAction={<NewStream refresh={refresh} />}
          headers={headers}
          data={data}
          toolbarItems={(
            <>
              <Button hasIconOnly kind="ghost" iconDescription="Refresh" renderIcon={Renew} onClick={() => refresh()}>
                Refresh
              </Button>
              <NewStream refresh={refresh} />
            </>
          )}
          renderRow={(row) => (
            <TableRow key={row.slug}>
              <TableCell>
                {row.label}
              </TableCell>
              <TableCell>{row.slug}</TableCell>
              <TableCell>
                {row.is_active ? <CheckmarkOutline /> : <MisuseOutline />}
              </TableCell>
              <TableCell>{row.clients}</TableCell>
              <TableCell>{row.destination_id || <em>None</em>}</TableCell>
              <TableCell>{row.is_routable ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <StreamMenu refresh={refresh} stream={row} />
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

export default Streams;
