import React, { useState } from 'react';
import useAxios from 'axios-hooks';
import PropTypes from 'prop-types';

import {
  Loading,
  TabList,
  Tab,
  Tabs,
  TabPanels,
  TabPanel,
} from '@carbon/react';

import useMatrix from '../../hooks/useMatrix.js';
import JSmpegPlayer from '../../common/JSmpegPlayer.jsx';

function ProbeWrapper() {
  const [channel, setChannel] = useState(0);
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  const {
    matrix, loading: matrixLoading, error: matrixError,
  } = useMatrix();

  return (
    <>
      {(matrixLoading || configLoading) && <Loading withOverlay />}
      {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
      {config && config.probe.router_destinations.length !== 0
      && (
      <Tabs selectedIndex={channel} onChange={(e) => setChannel(e.selectedIndex)}>
        <TabList aria-label="channels" activation="manual">
          { config && config.probe.router_destinations.map((dst, index) => (
            <Tab
              key={`probe-${dst}`}
            >
              Probe
              {' '}
              {index + 1}
              {' '}
              (
              {matrix.destinations?.[dst - 1]?.label}
              )
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          { config && config.probe.router_destinations.map((dst, index) => (
            <TabPanel
              key={`probe-${dst}`}
            >
              <Probe channel={index} active={channel === index} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      )}
    </>
  );
}

function Probe({ channel, active }) {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  const {
    matrix, probeStats, loading: matrixLoading, error: matrixError,
  } = useMatrix();

  return (
    <>
      {(matrixLoading || configLoading) && <Loading withOverlay />}
      {(matrixError || configError) && JSON.stringify({ matrixError, configError })}
      <strong>
        Status:
      </strong>
      {' '}
      {probeStats[channel]?.active_source ? `Streaming, ${probeStats[channel]?.clients} viewer${probeStats[channel]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
      <br />
      <br />
      <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${channel}`} active={probeStats[channel]?.active_source && active} />
      <br />
      <strong>
        Probe
        {' '}
        Source:
      </strong>
      {' '}
      {matrix.destinations?.[config.probe.router_destinations[channel] - 1]?.source?.label}
    </>
  );
}

Probe.propTypes = {
  channel: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
};

export default ProbeWrapper;
