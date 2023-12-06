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
      route(config.probe.router_destinations[selectedProbe], matrix.destinations[selectedDestination - 1].source.id);
    }
    if (config?.probe.enabled && selectedDestination === config.probe.router_destinations[selectedProbe] && ProbeSOTRouting) {
      setProbeSODRouting(false);
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      if (matrix.destinations[selectedDestination - 1].source.id !== matrix.destinations[config.probe.router_destinations[selectedProbe] - 1].source.id) {
        route(config.probe.router_destinations[selectedProbe], matrix.destinations[selectedDestination - 1].source.id);
      }
    }
  }, [matrix]);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      if (matrix.destinations[selectedDestination - 1].source.id !== matrix.destinations[config.probe.router_destinations[selectedProbe] - 1].source.id) {
        route(config.probe.router_destinations[selectedProbe], matrix.destinations[selectedDestination - 1].source.id);
      }
    }
  }, [ProbeSOTRouting]);

  useEffect(() => {
    if (config?.probe.enabled) {
      if (selectedDestination !== config.probe.router_destinations[selectedProbe]) {
        setSelectedDestination(config.probe.router_destinations[selectedProbe]);
      }
    }
  }, [selectedProbe]);

  useEffect(() => {
    if (config?.probe.enabled && selectedDestination === -1) {
      setSelectedDestination(config.probe.router_destinations[0]);
    }
  });

  return (
    <>
      {(matrixLoading || configLoading) && <Loading withOverlay />}
      {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
      {config && matrix
      && (
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
                <Button
                  onClick={() => { setSelectedDestination(button.id); }}
                  style={{
                    minWidth: '10px',
                    padding: '10px',
                    width: '100%',
                    height: '4em',
                    display: 'table',
                    marginBottom: '1px',
                    background: button.id === selectedDestination ? blue[60] : gray[70],
                  }}
                  size="xl"
                >
                  <>
                    <strong>{button.label}</strong>
                    <br />
                    {button.source?.label}
                  </>
                </Button>
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
                <Button
                  onClick={() => { route(selectedDestination, button.id); }}
                  style={{
                    minWidth: '10px',
                    padding: '10px',
                    width: '100%',
                    display: 'table',
                    marginBottom: '1px',
                    background: button.id === matrix.destinations[selectedDestination - 1]?.source?.id ? purple[60] : gray[70],
                  }}
                  size="xl"
                >
                  <>
                    <strong>{button.label}</strong>
                    <br />
                    {button.source?.label}
                  </>
                </Button>
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
              {matrix.sources?.[matrix.destinations?.[selectedDestination - 1]?.source.id]?.label}
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
                      {matrix.destinations?.[config.probe.router_destinations[selectedProbe] - 1]?.source?.label}
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
                      { config.probe.router_destinations.map((dst, index) => (
                        <Button
                          key={`probe-${dst}`}
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
                          Probe
                          {' '}
                          {index + 1}
                          {' '}
                          (
                          {matrix.destinations?.[dst - 1]?.label}
                          )
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
                        setSelectedDestination(config.probe.router_destinations[selectedProbe]);
                      }}
                      renderIcon={PortInput}
                      style={{
                        minWidth: '10px',
                        maxWidth: '100em',
                        width: '100%',
                        marginBottom: '1px',
                        background: selectedDestination === config.probe.router_destinations[selectedProbe] ? blue[60] : gray[60],
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
      )}
    </>
  );
}

export default Router;
