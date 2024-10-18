import { useParams } from 'react-router-dom';
import React, { useState } from 'react';

import {
  Column,
  Grid,
  TableRow,
  TableCell,
  Button,
  IconButton,
} from '@carbon/react';

import {
  Renew,
  Light,
  LightFilled,
  Edit, PortInput,
  PortOutput,
  DocumentImport,
} from '@carbon/icons-react';

import {
  green,
  red,
  // blue,
  // yellow,
  gray,
} from '@carbon/colors';

import { useQuery } from '@apollo/client';
import { GET_ROUTER } from '../queries';
import ImportLabelsModal from '../Modals/ImportLabelsModal.jsx';
import EditSpigotModal from '../Modals/EditSpigotModal.jsx';
import DataTable from '../../../components/DataTable/DataTable.jsx';
// import RouterMenu from './Menus/RoutersDataTableActionMenu.jsx';

const Spigots = function Spigots() {
  const { routerId } = useParams();
  const [importLabelsOpen, setImportLabelsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('sources');
  const [editState, setEditState] = useState({ open: false, type: null, spigot: null });

  const {
    loading, error, data, refetch,
  } = useQuery(GET_ROUTER, { variables: { id: routerId } });

  const headers = ['Number', 'Label', 'Description', 'UMD Text', 'Tally Address', 'Tally Status', selectedType === 'destinations' ? 'Routed Source' : null, 'Edit'].filter((n) => n);

  return (
    <Grid>
      <EditSpigotModal refresh={refetch} open={editState.open} setOpen={() => setEditState({ open: false, type: null, spigot: null })} spigot={editState.spigot} type={editState.type} />
      <ImportLabelsModal open={importLabelsOpen} setOpen={setImportLabelsOpen} refresh={refetch} routerId={routerId} />
      <Column sm={4} md={8} lg={16}>
        <DataTable
          title={`Spigots on ${data?.router.label}`}
          description="Spigots are the physical Inputs and Outputs available on this router"
          emptyTitle="There are no Spigots yet."
          emptyDescription="Spigots will be registered automatically when rtr connects to this router."
          headers={headers}
          data={data?.router[selectedType]}
          toolbarItems={(
            <>
              <Button hasIconOnly kind="ghost" iconDescription="Import Labels" renderIcon={DocumentImport} onClick={() => setImportLabelsOpen(true)}>
                Import Labels
              </Button>
              <Button kind={selectedType === 'sources' ? 'primary' : 'secondary'} iconDescription="Inputs" renderIcon={PortInput} onClick={() => setSelectedType('sources')}>
                Inputs
              </Button>
              <Button kind={selectedType === 'destinations' ? 'primary' : 'secondary'} iconDescription="Outputs" renderIcon={PortOutput} onClick={() => setSelectedType('destinations')}>
                Outputs
              </Button>
              <Button hasIconOnly kind="ghost" iconDescription="Refresh" renderIcon={Renew} onClick={() => refetch()}>
                Refresh
              </Button>
            </>
          )}
          renderRow={(row) => (
            <TableRow key={row.id}>
              <TableCell>
                {row.index}
              </TableCell>
              <TableCell>
                {row.label}
              </TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.umd}</TableCell>
              <TableCell>{row.tallyAddress || <em>None</em>}</TableCell>
              <TableCell>
                <span style={{ color: row.tallyGreen ? green[40] : gray[60] }}>{row.tallyGreen ? <LightFilled size={20} /> : <Light size={20} />}</span>
                <span style={{ color: row.tallyRed ? red[40] : gray[60] }}>{row.tallyRed ? <LightFilled size={20} /> : <Light size={20} />}</span>
                {/* <span style={{ color: row.tally3 ? blue[40] : gray[60] }}>{row.tally3 ? <LightFilled size={20} /> : <Light size={20} />}</span> */}
                {/* <span style={{ color: row.tally4 ? yellow[40] : gray[60] }}>{row.tally4 ? <LightFilled size={20} /> : <Light size={20} />}</span> */}
              </TableCell>
              {selectedType === 'destinations' && <TableCell>{row.routedSource?.label || 'Disconnected'}</TableCell>}
              <TableCell>
                <IconButton label="Edit Spigot" kind="ghost" size="sm" onClick={() => setEditState({ open: true, type: selectedType, spigot: row })}>
                  <Edit />
                </IconButton>
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

export default Spigots;
