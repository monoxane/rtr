import React from 'react';

import {
  Column,
  Grid,
  TableRow,
  TableCell,
  Button,
} from '@carbon/react';

import {
  Renew,
  CheckmarkOutline,
  MisuseOutline,
} from '@carbon/icons-react';

import { useQuery } from '@apollo/client';
import DataTable from '../../components/DataTable/DataTable.jsx';

import { LIST_STREAMS } from './queries';
import NewStream from './Modals/NewStream.jsx';
import StreamMenu from './Menus/StreamsDataTableActionMenu.jsx';

const Streams = function Streams() {
  const {
    loading, error, data, refetch,
  } = useQuery(LIST_STREAMS);

  const headers = ['Name', 'Slug', 'Active', 'Viewers', 'Destination', 'Is Routable', 'Actions'];

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <DataTable
          title="Stream Channels"
          description="Streams are real-time audio and video signals visible from within rtr"
          emptyTitle="There are no Stream Channels yet."
          emptyDescription="To get started, click New Channel."
          emptyAction={<NewStream refresh={refetch} />}
          headers={headers}
          data={data?.streams}
          toolbarItems={(
            <>
              <Button hasIconOnly kind="ghost" iconDescription="Refresh" renderIcon={Renew} onClick={() => refetch()}>
                Refresh
              </Button>
              <NewStream refresh={refetch} />
            </>
          )}
          renderRow={(row) => (
            <TableRow key={row.slug}>
              <TableCell>
                {row.label}
              </TableCell>
              <TableCell>{row.slug}</TableCell>
              <TableCell>
                {row.isActive ? <CheckmarkOutline /> : <MisuseOutline />}
              </TableCell>
              <TableCell>{row.clients}</TableCell>
              <TableCell>{row.destination || <em>None</em>}</TableCell>
              <TableCell>{row.isRoutable ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <StreamMenu refresh={refetch} stream={row} />
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

export default Streams;
