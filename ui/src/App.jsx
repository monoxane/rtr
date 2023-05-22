import React, { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';
import Favicon from 'react-favicon';

import {
  blue,
  gray,
  purple,
} from '@carbon/colors';

import {
  Button,
  Column,
  Content,
  Grid,
  Modal,
  Row,
} from '@carbon/react';

import {
  PortInput,
  PortOutput,
  Maximize,
  QueryQueue,
  ChooseItem,
} from '@carbon/icons-react';

import Header from './Header.jsx';
import Salvos from './Salvos.jsx';
import useMatrix from './useMatrix';
import JSmpegPlayer from './JSmpegPlayer.jsx';

import imgs from './imgs';

const App = function App() {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  const {
    matrix, probeStats, loading: matrixLoading, error: matrixError, route,
  } = useMatrix();
  const [selectedProbe, setSelectedProbe] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(1);
  const [ProbeSOTRouting, setProbeSODRouting] = useState(false);
  const [probeFullscreen, setProbeFullscreen] = useState(false);
  const [showSalvos, setShowSalvos] = useState(false);

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

  return (
    <>
      <Favicon url={imgs.favicon} />
      <>
        <Header />
        <Content style={{
          overflow: 'clip',
          background: gray[80],
        }}
        >
          {(matrixLoading || configLoading) && 'Loading'}
          {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
          {config && matrix
          && (
          <>
            {config.probe.enabled
              && (
              <Modal
                open={probeFullscreen}
                modalHeading={(
                  <>
                    <strong>
                      Probe
                      {selectedProbe + 1}
                      :
                      {' '}
                    </strong>
                    {' '}
                    {matrix.destinations?.[config.probe.router_destinations[selectedProbe] - 1]?.source?.label}
                  </>
)}
                passiveModal
                onRequestClose={() => setProbeFullscreen(false)}
                className="fullscreenProbe"
              >
                <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${selectedProbe}`} active={probeFullscreen && probeStats[selectedProbe]?.active_source} />
              </Modal>
              )}
            <Modal
              open={showSalvos}
              modalHeading={<strong>Salvos</strong>}
              passiveModal
              onRequestClose={() => setShowSalvos(false)}
            >
              <Salvos />
            </Modal>
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
                    <h1>Controls</h1>
                  </Column>
                </Grid>
                <Grid
                  style={{
                    height: '80vh',
                  }}
                >
                  <Column sm={4} lg={4}>
                    { config.probe.enabled
                      && (
                      <>
                        { config.probe.router_destinations.map((dst, index) => (
                          <Button
                            key={`probe-${dst}`}
                            onClick={() => {
                              setSelectedProbe(index);
                            }}
                            renderIcon={ChooseItem}
                            style={{
                              minWidth: '10px',
                              display: 'table',
                              marginBottom: '1px',
                              width: '100%',
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
                        <Row>
                          <strong>
                            Status:
                          </strong>
                          {' '}
                          {probeStats[selectedProbe]?.active_source ? `Streaming, ${probeStats[selectedProbe]?.clients} viewer${probeStats[selectedProbe]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
                          <br />
                          <br />
                          <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${selectedProbe}`} active={!probeFullscreen && probeStats[selectedProbe]?.active_source} />
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
                        </Row>
                        <br />
                        <Button
                          onClick={() => {
                            setProbeSODRouting(!ProbeSOTRouting);
                          }}
                          renderIcon={PortOutput}
                          style={{
                            minWidth: '10px',
                            display: 'table',
                            marginBottom: '1px',
                            width: '100%',
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
                            display: 'table',
                            marginBottom: '1px',
                            width: '100%',
                            background: selectedDestination === config.probe.router_destinations[selectedProbe] ? blue[60] : gray[60],
                          }}
                        >
                          <strong>Standalone Probe</strong>
                        </Button>
                        <Button
                          label="Maximise Probe"
                          onClick={() => setProbeFullscreen(true)}
                          renderIcon={Maximize}
                          kind="secondary"
                          style={{
                            minWidth: '10px',
                            display: 'table',
                            marginBottom: '1px',
                            width: '100%',
                          }}
                        >
                          Maximize Probe View
                        </Button>
                        <br />
                        <br />
                      </>
                      )}
                    {/* END PROBE */}
                    <Grid>
                      <Column sm={4}>
                        <h3>Salvos</h3>
                      </Column>
                      <Column sm={4}>
                        <Button
                          label="Salvos"
                          onClick={() => setShowSalvos(true)}
                          renderIcon={QueryQueue}
                          kind="secondary"
                          style={{
                            minWidth: '10px',
                            display: 'table',
                            marginBottom: '1px',
                            width: '100%',
                          }}
                        >
                          Show Salvos
                        </Button>
                      </Column>
                    </Grid>
                  </Column>
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
                          height: '4em',
                          display: 'table',
                          marginBottom: '1px',
                          background: button.id === matrix.destinations[selectedDestination - 1]?.source?.id ? purple[60] : gray[70],
                        }}
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
            </Grid>
          </>
          )}
        </Content>
      </>
    </>
  );
};

export default App;
