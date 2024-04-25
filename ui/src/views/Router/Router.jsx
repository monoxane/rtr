import React, { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';

import {
  blue,
  gray,
  purple,
} from '@carbon/colors';

import {
  Button,
  Column,
  Grid,
  Loading,
} from '@carbon/react';

import {
  PortInput,
  PortOutput,
  ChooseItem,
  Launch,
} from '@carbon/icons-react';

import useMatrix from '../../hooks/useMatrix.js';
import JSmpegPlayer from '../../common/JSmpegPlayer.jsx';

import Destination from './DestinationButton.jsx';
import Source from './SourceButton.jsx';
import EditIOModal from './EditIOModal.jsx';

function openInNewTab(url) {
  window.open(url, '_blank').focus();
}

function Router() {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  const {
    matrix, probeStats, loading: matrixLoading, error: matrixError, route,
  } = useMatrix();
  const [selectedProbe, setSelectedProbe] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(-1);
  const [ProbeSOTRouting, setProbeSODRouting] = useState(false);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      route(config.probe.channels[selectedProbe].router_destination, matrix.destinations[selectedDestination - 1].source.id);
    }
    if (config?.probe.enabled && selectedDestination === config.probe.channels[selectedProbe].router_destination && ProbeSOTRouting) {
      setProbeSODRouting(false);
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      if (matrix.destinations[selectedDestination - 1].source.id !== matrix.destinations[config.probe.channels[selectedProbe].router_destination - 1].source.id) {
        route(config.probe.channels[selectedProbe].router_destination, matrix.destinations[selectedDestination - 1].source.id);
      }
    }
  }, [matrix]);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      if (matrix.destinations[selectedDestination - 1].source.id !== matrix.destinations[config.probe.channels[selectedProbe].router_destination - 1].source.id) {
        route(config.probe.channels[selectedProbe].router_destination, matrix.destinations[selectedDestination - 1].source.id);
      }
    }
  }, [ProbeSOTRouting]);

  useEffect(() => {
    if (config?.probe.enabled) {
      if (selectedDestination !== config.probe.channels[selectedProbe].router_destination) {
        setSelectedDestination(config.probe.channels[selectedProbe].router_destination);
      }
    }
  }, [selectedProbe]);

  useEffect(() => {
    if (config?.probe.enabled && selectedDestination === -1) {
      setSelectedDestination(config.probe.channels[0].router_destination);
    }
  });

  const [editModalState, setEditModalState] = useState({ open: false });

  const setModalOpenState = (open) => {
    setEditModalState({ ...editModalState, open });
  };

  return (
    <>
      {(matrixLoading || configLoading) && <Loading withOverlay />}
      {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
      {config && matrix
      && (
        <>
          <EditIOModal IO={editModalState.IO || {}} open={editModalState.open} type={editModalState.type || 'none'} setOpen={setModalOpenState} />
          <Grid>
            <Column sm={4} lg={6} className="destinations">
              <Grid condensed>
                <Column sm={4} lg={6}>
                  <h1>Destinations</h1>
                </Column>
              </Grid>
              <Grid
                condensed
                className="iolist"
              >
                { matrix.destinations && matrix.destinations.map((button) => (
                  <Column sm={2} lg={2} key={button.id}>
                    <Destination
                      destination={button}
                      onClick={() => setSelectedDestination(button.id)}
                      onEdit={() => {
                        setEditModalState({ open: true, type: 'destination', IO: button });
                      }}
                      selected={button.id === selectedDestination}
                    />
                  </Column>
                ))}
              </Grid>
            </Column>
            <Column sm={4} lg={6} className="sources">
              <Grid condensed>
                <Column sm={4}>
                  <h1>Sources</h1>
                </Column>
              </Grid>
              <Grid
                condensed
                className="iolist"
              >
                { matrix.sources && matrix.sources.map((button) => (
                  <Column sm={2} lg={2} key={button.id}>
                    <Source
                      source={button}
                      onClick={() => { route(selectedDestination, button.id); }}
                      onEdit={() => {
                        setEditModalState({ open: true, type: 'source', IO: button });
                      }}
                      selected={button.id === matrix.destinations[selectedDestination - 1]?.source?.id}
                    />
                  </Column>
                ))}
              </Grid>
            </Column>
            <Column sm={4} lg={4}>
              <Grid>
                <Column sm={4}>
                  <h1>Status</h1>
                </Column>
              </Grid>
              <Grid>
                <Column sm={4} lg={8}>
                  {selectedDestination === -1 && <em> No Destination Selected</em>}
                  {selectedDestination !== -1 && (
                  <>
                    <strong>
                      Destination:
                    </strong>
                    {' '}
                    {matrix.destinations?.[selectedDestination - 1]?.label}
                    <br />
                    <strong>
                      Source:
                    </strong>
                    {' '}
                    {matrix.destinations?.[selectedDestination - 1]?.source.label}
                  </>
                  )}
                  <br />
                  { config.probe.enabled
                  && (
                    <>
                      <hr />
                      <h3>Probe</h3>
                      <strong>
                        Status:
                      </strong>
                        {' '}
                        {probeStats[selectedProbe]?.active_source ? `Streaming, ${probeStats[selectedProbe]?.clients} viewer${probeStats[selectedProbe]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
                      <br />
                      <strong>
                        Probe
                        {' '}
                        Follow:
                      </strong>
                        {' '}
                        {ProbeSOTRouting ? matrix.destinations?.[selectedDestination - 1]?.label : 'None'}
                      <br />
                      <strong>
                        Probe
                        {' '}
                        Source:
                      </strong>
                        {' '}
                        {matrix.destinations?.[config.probe.channels[selectedProbe].router_destinations - 1]?.source?.label}
                      <br />
                      <br />
                      <div className="openProbeOverlay">
                        <Button
                          hasIconOnly
                          renderIcon={Launch}
                          kind="ghost"
                          iconDescription="Open Probe in New Tab"
                          onClick={() => {
                            openInNewTab(`${document.location.protocol}//${document.location.hostname}:${document.location.port}/probe`);
                          }}
                        />
                      </div>
                      <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${selectedProbe}`} active={probeStats[selectedProbe]?.active_source} />
                      <br />
                        { config.probe.channels.map((channel, index) => (
                          <Button
                            key={`probe-${channel.id}`}
                            onClick={() => {
                              setSelectedProbe(index);
                            }}
                            renderIcon={ChooseItem}
                            style={{
                              minWidth: '100%',
                              width: '100%',
                              marginBottom: '1px',
                              background: selectedProbe === index ? blue[60] : gray[70],
                            }}
                          >
                            {channel.label}
                            {' '}
                            {channel.router_destination !== 0 && (
                            <>
                              (
                              {matrix.destinations?.[channel.router_destination - 1]?.label}
                              )
                            </>
                            )}
                          </Button>
                        ))}
                      <br />
                      <br />
                      <Button
                        onClick={() => {
                          setProbeSODRouting(!ProbeSOTRouting);
                        }}
                        renderIcon={PortOutput}
                        style={{
                          minWidth: '10px',
                          maxWidth: '100em',
                          width: '100%',
                          display: 'table',
                          marginBottom: '1px',
                          background: ProbeSOTRouting ? purple[60] : gray[60],
                        }}
                      >
                        <strong>
                          Follow
                          {ProbeSOTRouting && 'ing'}
                          {' '}
                          Destination
                        </strong>
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedDestination(config.probe.channels[selectedProbe].router_destination);
                        }}
                        renderIcon={PortInput}
                        style={{
                          minWidth: '10px',
                          maxWidth: '100em',
                          width: '100%',
                          marginBottom: '1px',
                          background: selectedDestination === config.probe.channels[selectedProbe].router_destination ? blue[60] : gray[60],
                        }}
                      >
                        <strong>Standalone Probe</strong>
                      </Button>
                    </>
                  )}
                </Column>
              </Grid>
            </Column>
          </Grid>
        </>
      )}
    </>
  );
}

export default Router;
