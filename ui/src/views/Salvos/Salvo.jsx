import React, { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';
import axios from 'axios';

import { useParams } from 'react-router-dom';

import {
  Button,
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
  TableToolbarMenu,
  TableToolbarAction,
} from '@carbon/react';

import {
  TrashCan,
  MagicWand,
  WarningAlt,
  Edit,
  Save,
  AddAlt,
  Add,
} from '@carbon/icons-react';
import useMatrix from '../../hooks/useMatrix';

const Salvo = function Salvo() {
  const {
    matrix, route,
  } = useMatrix();

  const [{ data: config, loading: configLoading, error: configError }, refresh] = useAxios(
    '/v1/config',
  );

  const { id } = useParams();
  const [salvo, setCurrentSalvo] = useState({});
  const [originalSalvo, setOriginalSalvo] = useState({});

  const [search, setSearch] = useState('');

  const [filteredSalvoDestinations, setFilteredSalvoDestinations] = useState([]);
  const [filteredRouterDestinations, setFilteredRouterDestinations] = useState([]);

  useEffect(() => {
    if (salvo.label !== id) {
      config?.salvos.forEach((configSalvo) => {
        if (configSalvo.label === id) {
          setCurrentSalvo(configSalvo);
          setOriginalSalvo(configSalvo);
          setFilteredSalvoDestinations(configSalvo.destinations);
        }
      });
    }
  }, [config, id]);

  const getFilteredSalvoDestinations = () => (
    salvo.destinations.filter((d) => d.label.toLowerCase().includes(search))
  );

  const getFilteredRouterDestinations = () => (
    matrix.destinations.filter((d) => d.label.toLowerCase().includes(search) && !getFilteredSalvoDestinations().find((dst) => d.id === dst.id))
  );

  useEffect(() => {
    if (search === '') {
      setFilteredSalvoDestinations(salvo.destinations ?? []);
      setFilteredRouterDestinations([]);
    } else {
      setFilteredSalvoDestinations(getFilteredSalvoDestinations());
      setFilteredRouterDestinations(getFilteredRouterDestinations());
    }
  }, [search, config, salvo]);

  const headers = ['Destination', 'Saved Source', 'Current Source', 'Actions'];

  const recallSalvo = () => {
    salvo.destinations.forEach((destination, index) => {
      setTimeout(
        () => route(destination.id, destination.source.id),
        100 * index,
      );
    });
  };

  const saveCurrentSalvo = () => {
    const salvoPatch = { ...salvo };
    salvoPatch.destinations.map((destination, index) => { salvoPatch.destinations[index] = matrix.destinations[destination.id - 1]; return null; });
    axios.post('/v1/salvos', salvoPatch)
      .then(() => {
        refresh();
      });
  };

  return (
    <Grid>
      {configLoading && 'Loading...'}
      {configError && 'Error'}
      {!configLoading && !configError
        && (
          <Column sm={4} md={8} lg={16}>
              {salvo.label
              && (
              <TableContainer title={`Salvos / ${salvo.label} / Default`}>
                <TableToolbar>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      onChange={(event) => {
                        setSearch(event.target.value.toLowerCase());
                      }}
                      persistent
                      placeholder="Search for a Destination in the Salvo or Router"
                    />
                    {/* <TableToolbarMenu renderIcon={Edit}>
                      <TableToolbarAction onClick={() => {}}>
                        Edit
                      </TableToolbarAction>
                    </TableToolbarMenu> */}
                    <IconButton
                      disabled={salvo === originalSalvo}
                      kind="danger"
                      label="Save Salvo"
                      renderIcon={Save}
                      onClick={() => saveCurrentSalvo()}
                    />
                    <Button
                      disabled={!salvo.label}
                      kind="primary"
                      onClick={() => recallSalvo()}
                      renderIcon={MagicWand}
                    >
                      Recall All
                    </Button>
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
                    {filteredSalvoDestinations.length === 0 && (
                    <TableRow>
                      <TableCell>Nothing Found in this Salvo</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                    )}
                    {filteredSalvoDestinations?.map((row) => row != null && (
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
                            label="Remove from Salvo"
                            renderIcon={TrashCan}
                            size="md"
                            onClick={() => setCurrentSalvo({ ...salvo, destinations: [...salvo.destinations.filter((savedDestination) => savedDestination.id !== row.id)] })}
                          />
                          <IconButton
                            kind="ghost"
                            label="Save Destination"
                            renderIcon={AddAlt}
                            size="md"
                          />
                          <Button
                            kind="ghost"
                            label="Recall this Destination"
                            renderIcon={MagicWand}
                            size="md"
                            onClick={() => { route(row.id, row.source.id); }}
                          >
                            Recall

                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {search !== '' && (
                    <>
                      <TableHead>
                        <TableRow>
                          {['Router Destination', '', 'Current Source', 'Add to Salvo'].map((header) => (
                            <TableHeader id={header.key} key={header}>
                              <em>{header}</em>
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRouterDestinations.map((row) => row != null && (
                        <TableRow key={row.id}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell />
                          <TableCell>
                            {matrix.destinations[row.id - 1].source.label}
                            {' '}
                            {matrix.destinations[row.id - 1].source.id !== row.source.id && <WarningAlt />}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              kind="ghost"
                              label="Add to Salvo"
                              size="md"
                              renderIcon={Add}
                              onClick={() => {
                                setCurrentSalvo({ ...salvo, destinations: [...salvo.destinations, row].sort((a, b) => (a.id - b.id)) });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}
                </Table>
              </TableContainer>
              )}
          </Column>
        )}
    </Grid>
  );
};

export default Salvo;
