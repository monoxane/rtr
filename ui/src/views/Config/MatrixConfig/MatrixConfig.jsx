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
  TableToolbar, TableToolbarContent, TableToolbarSearch,
  DataTableSkeleton,
  Tabs, TabList, Tab, TabPanels, TabPanel,
  Button,
} from '@carbon/react';

import {
  TagImport,
} from '@carbon/icons-react';

import useMatrix from '../../../hooks/useMatrix.js';

import SpigotConfig from './SpigotConfig.jsx';
import DashboardLabelsUploadModal from './DashboardLabelsUpload.jsx';

import './matrixConfig.scss';

const MatrixConfig = function MatrixConfig() {
  const {
    matrix, loading: matrixLoading, error: matrixError,
  } = useMatrix();

  const [importDashboardOpen, setImportDashboardOpen] = useState(false);

  const headers = ['Spigot', 'Label', 'Description'];

  return (
    <Grid>
      {importDashboardOpen && <DashboardLabelsUploadModal open={importDashboardOpen} setOpen={setImportDashboardOpen} />}
      {matrixLoading
        && (
          <Column sm={4} lg={16}>
            <DataTableSkeleton headers={headers} aria-label="sample table" />
          </Column>
        )}
      {matrixError && 'Error'}
      {!matrixLoading && !matrixError
        && (
        <Column sm={4} md={8} lg={16}>
          <TableContainer title="Matrix Configuration" description="Spigot Labels and Descriptions">
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch onChange={() => {}} placeholder="Search for a Salvo" />
                <Button hasIconOnly kind="ghost" renderIcon={TagImport} iconDescription="Import Dashboard Labels" onClick={() => { setImportDashboardOpen((c) => !c); }}>Primary Button</Button>
              </TableToolbarContent>
            </TableToolbar>
            <Tabs>
              <TabList aria-label="List of tabs" contained fullWidth>
                <Tab>Destinations</Tab>
                <Tab>Sources</Tab>
              </TabList>
              <TabPanels>
                <TabPanel style={{ padding: 0 }}>
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
                      { matrix.destinations && matrix.destinations.map((row) => (
                        <SpigotConfig spigot={row} type="destination" />
                      ))}
                    </TableBody>
                  </Table>
                </TabPanel>
                <TabPanel style={{ padding: 0 }}>
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
                      { matrix.sources && matrix.sources.map((row) => (
                        <SpigotConfig spigot={row} type="source" />
                      ))}
                    </TableBody>
                  </Table>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TableContainer>
        </Column>
        )}
    </Grid>
  );
};

export default MatrixConfig;
