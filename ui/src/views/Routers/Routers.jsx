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

import { LIST_ROUTERS } from './queries';
import NewRouter from './Modals/NewRouter.jsx';
// import StreamMenu from './Menus/StreamsDataTableActionMenu.jsx';

const Routers = function Streams() {
  const {
    loading, error, data, refetch,
  } = useQuery(LIST_ROUTERS);

  const headers = ['Name', 'Slug', 'Active', 'Viewers', 'Destination', 'Is Routable', 'Actions'];

  return (
    <Grid>
      <Column sm={4} md={8} lg={16}>
        <DataTable
          title="Routers"
          description="Routers are signal matrixes controllable from rtr"
          emptyTitle="There are no Routers yet."
          emptyDescription="To get started, click New Router."
          emptyAction={<NewRouter refresh={refetch} />}
          headers={headers}
          data={data?.streams}
          toolbarItems={(
            <>
              <Button hasIconOnly kind="ghost" iconDescription="Refresh" renderIcon={Renew} onClick={() => refetch()}>
                Refresh
              </Button>
              <NewRouter refresh={refetch} />
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
                {/* <StreamMenu refresh={refetch} stream={row} /> */}
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

export default Routers;
