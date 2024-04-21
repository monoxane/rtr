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
  Button,
} from '@carbon/react';

import {
  Information,
} from '@carbon/icons-react';

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
      {config && config.probe.channels.length !== 0
      && (
      <Tabs selectedIndex={channel} onChange={(e) => setChannel(e.selectedIndex)}>
        <TabList contained aria-label="channels" activation="manual" fullWidth>
          { config && config.probe.channels.map((probeChannel) => (
            <Tab
              key={`probe-${probeChannel.id}`}
            >
              {probeChannel.label}
              {' '}
              (
              {matrix.destinations?.[probeChannel.router_destination - 1]?.label}
              )
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          { config && config.probe.channels.map((probeChannel, index) => (
            <TabPanel
              key={`probe-${probeChannel.id}`}
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
      <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${channel}`} active={probeStats[channel]?.active_source && active} />
      {/* <Tooltip label={(
        <>
          <strong>
            Probe
            {' '}
            Source:
          </strong>
          {' '}
          {matrix.destinations?.[config.probe.router_destinations[channel] - 1]?.source?.label}
          <br />
          <strong>
            Status:
          </strong>
          {' '}
          {probeStats[channel]?.active_source ? `Streaming, ${probeStats[channel]?.clients} viewer${probeStats[channel]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
        </>
      )}
      > */}
      <div className="probeInfo">
        <Button
          hasIconOnly
          renderIcon={Information}
          kind="ghost"
          tooltipPosition="right"
          iconDescription={(
            <>
              <strong>
                Probe
                {' '}
                Source:
              </strong>
              {' '}
              {matrix.destinations?.[config.probe.channels[channel].router_destination - 1]?.source?.label}
              <br />
              <strong>
                Status:
              </strong>
              {' '}
              {probeStats[channel]?.active_source ? `Streaming, ${probeStats[channel]?.clients} viewer${probeStats[channel]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
            </>
          )}
        />
      </div>
      {/* </Tooltip> */}
    </>
  );
}

Probe.propTypes = {
  channel: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
};

export default ProbeWrapper;
