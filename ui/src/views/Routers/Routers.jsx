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

import {
  green,
  red,
} from '@carbon/colors';

import { useQuery } from '@apollo/client';
import DataTable from '../../components/DataTable/DataTable.jsx';

import { LIST_ROUTERS } from './queries';
import NewRouter from './Modals/NewRouter.jsx';
import RouterMenu from './Menus/RoutersDataTableActionMenu.jsx';

const Routers = function Routers() {
  const {
    loading, error, data, refetch,
  } = useQuery(LIST_ROUTERS);

  const headers = ['Name', 'Provider', 'Model', 'IP', 'Connected', 'Actions'];

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
          data={data?.routers}
          toolbarItems={(
            <>
              <Button hasIconOnly kind="ghost" iconDescription="Refresh" renderIcon={Renew} onClick={() => refetch()}>
                Refresh
              </Button>
              <NewRouter refresh={refetch} />
            </>
          )}
          renderRow={(row) => (
            <TableRow key={row.id}>
              <TableCell>
                {row.label}
              </TableCell>
              <TableCell>{row.provider.label}</TableCell>
              <TableCell>{row.model.label}</TableCell>
              <TableCell>{row.ipAddress}</TableCell>
              <TableCell>
                <span style={{ color: row.isConnected ? green[40] : red[60] }}>{row.isConnected ? <CheckmarkOutline size={20} /> : <MisuseOutline size={20} />}</span>
              </TableCell>
              <TableCell>
                <RouterMenu refresh={refetch} router={row} />
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
