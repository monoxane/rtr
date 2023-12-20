import React from 'react';
import useAxios from 'axios-hooks';
import { useNavigate } from 'react-router-dom';

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
  IconButton,
  DataTableSkeleton,
} from '@carbon/react';

import {
  TrashCan,
  ArrowRight,
} from '@carbon/icons-react';

import NewSalvo from './NewSalvo.jsx';

const Salvos = function Salvos() {
  const [{ data: config, loading: configLoading, error: configError }, refresh] = useAxios(
    '/v1/config',
  );

  const navigate = useNavigate();

  const headers = ['Salvo', 'Destinations', 'Actions'];

  return (
    <Grid>
      {configLoading
        && (
          <Column sm={4} lg={16}>
            <DataTableSkeleton headers={headers} aria-label="sample table" />
          </Column>
        )}
      {configError && 'Error'}
      {!configLoading && !configError
        && (
        <Column sm={4} lg={16}>
          <TableContainer title="Salvos">
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch onChange={() => {}} placeholder="Search for a Salvo" />
                <NewSalvo refresh={refresh} />
                {/* <Button
                  kind="primary"
                  renderIcon={Add}
                  // onClick={() => recallCurrentSalvo()}
                >
                  New Salvo
                </Button> */}
                {/* </TableToolbarMenu> */}
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
                {config.salvos?.map((row) => row != null && (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.destinations.length}</TableCell>
                  <TableCell>
                    <IconButton
                      kind="ghost"
                      label="Delete"
                      renderIcon={TrashCan}
                      size="md"
                    />
                    <IconButton
                      kind="ghost"
                      label="Open"
                      renderIcon={ArrowRight}
                      iconOnly
                      size="md"
                      onClick={() => { navigate(`/salvos/${row.label}`); }}
                    />
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

export default Salvos;
