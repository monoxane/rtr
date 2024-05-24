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
  Tile,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from '@carbon/react';

import {
  PortInput,
  Video,
  PortOutput,
  Launch,
  // Rocket,
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
  const [selectedDestination, setSelectedDestination] = useState(0);
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
    if (config?.probe.enabled && selectedDestination === 0) {
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
        <div className="router">
          <EditIOModal IO={editModalState.IO || {}} open={editModalState.open} type={editModalState.type || 'none'} setOpen={setModalOpenState} />
          <Grid condensed>
            <Column sm={4} lg={6}>
              <Tile className="destinations">
                <Grid condensed>
                  <Column sm={4} lg={6}>
                    <h2>
                      Destinations
                    </h2>
                  </Column>
                </Grid>
                <br />
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
              </Tile>
            </Column>
            <Column sm={4} lg={6}>
              <Tile className="sources">
                <Grid condensed>
                  <Column sm={4}>
                    <h2>
                      Sources
                    </h2>
                  </Column>
                </Grid>
                <br />
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
              </Tile>
            </Column>
            <Column sm={4} lg={4} className="routerMeta">
              {/* <Column sm={4} lg={4} className="routerMeta hasTake"> */}
              <Tile className="routerStatus">
                <h2>Status</h2>
                <br />
                {/* <Button
                  renderIcon={Rocket}
                  kind="danger"
                  disabled
                  iconDescription="Take Source to Destination"
                  onClick={() => {
                    // openInNewTab(`${document.location.protocol}//${document.location.hostname}:${document.location.port}/probe`);
                  }}
                  style={{ width: '100%', marginBottom: '0.5em' }}
                >
                  TAKE
                </Button> */}
                <Tabs>
                  <TabList contained fullWidth>
                    <Tab>Destination</Tab>
                    <Tab>Source</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <p>
                        Spigot: Out
                        {' '}
                        {matrix.destinations?.[selectedDestination - 1]?.id || <em>None</em>}
                        <br />
                        Label:
                        {' '}
                        {matrix.destinations?.[selectedDestination - 1]?.label || <em>None</em>}
                        <br />
                        Description:
                        {' '}
                        {matrix.destinations?.[selectedDestination - 1]?.description || <em>None</em>}
                      </p>
                    </TabPanel>
                    <TabPanel>
                      <p>
                        Spigot: In
                        {' '}
                        {matrix.destinations?.[selectedDestination - 1]?.source.id || <em>None</em>}
                        <br />
                        Label:
                        {' '}
                        {matrix.destinations?.[selectedDestination - 1]?.source.label || <em>None</em>}
                        <br />
                        Description:
                        {' '}
                        {matrix.destinations?.[selectedDestination - 1]?.source.description || <em>None</em>}
                      </p>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Tile>
              { config.probe.enabled
              && (
                <Tile className="routerProbe">
                  <h2>Probe</h2>
                  <br />
                  <div className="openProbeOverlay">
                    <Button
                      hasIconOnly
                      renderIcon={Launch}
                      align="left"
                      kind="ghost"
                      iconDescription="Open Probe in New Tab"
                      onClick={() => {
                        openInNewTab(`${document.location.protocol}//${document.location.hostname}:${document.location.port}/probe`);
                      }}
                    />
                  </div>
                  <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${config.probe.channels[selectedProbe].slug}`} active={probeStats[config.probe.channels[selectedProbe].slug]?.active_source} />
                  <br />
                  <strong>
                    Status:
                  </strong>
                  {' '}
                  {probeStats[selectedProbe]?.active_source ? `Streaming, ${probeStats[selectedProbe]?.clients} viewer${probeStats[selectedProbe]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}

                  {config.probe.channels[selectedProbe].router_destination !== 0 ? (
                    <>
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
                        Probe Source:
                      </strong>
                      {' '}
                      {matrix.destinations?.[config.probe.channels[selectedProbe].router_destination - 1]?.source?.label}
                    </>
                  ) : (
                    <>
                      <br />
                      <em>Non-Routable External Source</em>
                      <br />
                    </>
                  )}
                  <br />
                  <br />
                    { config.probe.channels.map((channel, index) => (
                      <Button
                        key={`probe-${channel.id}`}
                        onClick={() => {
                          setSelectedProbe(index);
                          setSelectedDestination(config.probe.channels[index].router_destination);
                        }}
                        renderIcon={channel.router_destination === 0 ? Video : PortInput}
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
                      // marginBottom: '1px',
                      background: ProbeSOTRouting ? purple[60] : gray[60],
                    }}
                    disabled={config.probe.channels[selectedProbe].router_destination === 0}
                  >
                    <strong>
                      Follow
                      {ProbeSOTRouting && 'ing'}
                      {' '}
                      Destination
                    </strong>
                  </Button>
                </Tile>
              )}
            </Column>
          </Grid>
        </div>
      )}
    </>
  );
}

export default Router;
