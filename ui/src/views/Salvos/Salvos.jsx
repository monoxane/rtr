import React, { useState } from 'react';
import useAxios from 'axios-hooks';
import axios from 'axios';

import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  Grid,
  Tag,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
  IconButton,
} from '@carbon/react';

import {
  TrashCan,
  Redo,
  ArrowRight,
  Edit,
  WarningAlt,
} from '@carbon/icons-react';
import useMatrix from '../../hooks/useMatrix';

const Salvos = function Salvos() {
  const {
    matrix, route,
  } = useMatrix();

  const [{ data: config, loading: configLoading, error: configError }, refresh] = useAxios(
    '/v1/config',
  );

  const [currentSalvo, setCurrentSalvo] = useState({});
  const [newSalvoName, setNewSalvoName] = useState();

  const headers = ['Destination', 'Saved Source', 'Current Source', 'Actions'];

  const recallCurrentSalvo = () => {
    currentSalvo.destinations.forEach((destination, index) => {
      setTimeout(
        () => route(destination.id, destination.source.id),
        100 * index,
      );
    });
  };

  const saveCurrentSalvo = () => {
    const salvo = { ...currentSalvo };
    salvo.destinations.map((destination) => destination = matrix.destinations[destination.id - 1]);
    axios.post('/v1/salvos', salvo)
      .then(() => {
        refresh();
      })
      .catch((err) => {
        console.log('unable to save salvo', err);
      });
  };

  return (
    <Grid>
      {configLoading && 'Loading...'}
      {configError && 'Error'}
      {!configLoading && !configError
        && (
          <>
            <Column sm={2} lg={3}>
              <h3>Salvos</h3>
              <br />
              { config.salvos.map((salvo) => (
                <Button
                  style={{
                    width: '100%',
                    marginBottom: '1px',
                  }}
                  kind={salvo.label === currentSalvo.label ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => { setCurrentSalvo(salvo); }}
                  renderIcon={ArrowRight}
                >
                  {salvo.label}
                </Button>
              ))}
              <br />
              <br />
              <Button
                style={{
                  width: '100%',
                  marginBottom: '1px',
                }}
                  // kind={salvo.label === currentSalvo.label ? 'primary' : 'secondary'}
                size="md"
                  // onClick={() => { setCurrentSalvo(salvo); }}
                renderIcon={Edit}
              >
                New Salvo
              </Button>
            </Column>
            <Column sm={4} lg={13}>
              {currentSalvo.label
              && (
              <>
                <TableContainer title={currentSalvo.label}>
                  <TableToolbar>
                    <TableToolbarContent>
                      <TableToolbarSearch onChange={() => {}} persistent placeholder="Search for an Input" />
                      {/* <ComboBox
                        items={[newSalvoName && { label: `${newSalvoName} (New)` }, ...config.salvos].filter(Boolean)}
                        selectedItem={currentSalvo}
                        itemToString={(item) => (item ? item.label : '')}
                        placeholder="Type to Filter..."
                        style={{ height: '100%' }}
                        onChange={(event) => {
                          if (event.selectedItem == null) { return; }
                          if (event.selectedItem.destinations === undefined) {
                            if (newSalvoName !== '') {
                              setCurrentSalvo({ label: newSalvoName, destinations: [] });
                            }
                          } else {
                            setCurrentSalvo(event.selectedItem);
                          }
                        }}
                        onInputChange={(event) => setNewSalvoName(event)}
                      /> */}
                      {/* <TableToolbarMenu light> */}
                      <Button
                        disabled={!currentSalvo.label}
                        kind="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        disabled={!currentSalvo.label}
                        kind="secondary"
                        onClick={() => saveCurrentSalvo()}
                      >
                        Save
                      </Button>
                      <Button
                        disabled={!currentSalvo.label}
                        kind="primary"
                        onClick={() => recallCurrentSalvo()}
                      >
                        Recall
                      </Button>
                      {/* </TableToolbarMenu> */}
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table size="md" useZebraStyles={false} style={{ height: '80%', overflow: 'scroll' }}>
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
                      {currentSalvo.destinations?.map((row) => row != null && (
                      <TableRow key={row.id}>
                        <TableCell>{row.label}</TableCell>
                        <TableCell>{row.source.label}</TableCell>
                        <TableCell>
                          {matrix.destinations[row.id - 1].source.label}
                          {' '}
                          {matrix.destinations[row.id - 1].source.id !== row.source.id && <WarningAlt />}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            kind="ghost"
                            label="Recall this Destination"
                            size="sm"
                            onClick={() => { route(row.id, row.source.id); }}
                          >
                            <Redo />
                          </IconButton>
                          <IconButton
                            kind="ghost"
                            label="Remove from Salvo"
                            size="sm"
                            onClick={() => setCurrentSalvo({ ...currentSalvo, destinations: [...currentSalvo.destinations.filter((savedDestination) => savedDestination.id !== row.id)] })}
                          >
                            <TrashCan />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* <ComboBox
                  items={matrix.destinations?.filter((destination) => !currentSalvo.destinations.find(({ id }) => destination.id === id))}
                  itemToString={(item) => (item ? `${item.label} <= ${item.source.label}` : '')}
                  placeholder="Type to Filter..."
                  helperText="Add Destination to Salvo"
                  direction={currentSalvo.destinations.length > 10 ? 'top' : 'bottom'}
                  onChange={
                  (event) => {
                    if (event.selectedItem) setCurrentSalvo({ ...currentSalvo, destinations: [...currentSalvo.destinations, event.selectedItem].sort((a, b) => (a.id - b.id)) });
                  }
                }
                /> */}
              </>
              )}
            </Column>
          </>
        )}
    </Grid>
  );
};

export default Salvos;
