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
  const [activeTab, setTab] = useState(0);
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
      <Tabs selectedIndex={activeTab} onChange={(e) => setTab(e.selectedIndex)}>
        <TabList contained aria-label="channels" activation="manual" fullWidth>
          { config && config.probe.channels.map((probeChannel, index) => (
            <Tab
              key={`probe-${probeChannel.id}`}
            >
              {probeChannel.label}
              {' '}
              {config.probe.channels[index].router_destination !== 0
              && (
              <>
                (
                {matrix.destinations?.[probeChannel.router_destination - 1]?.label}
                )
              </>
              )}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          { config && config.probe.channels.map((probeChannel, index) => (
            <TabPanel
              key={`probe-${probeChannel.slug}`}
            >
              <Probe index={index} slug={probeChannel.slug} active={activeTab === index} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      )}
    </>
  );
}

function Probe({ index, slug, active }) {
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
      <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${slug}`} active={probeStats[index]?.active_source && active} />
      <div className="probeInfo">
        <Button
          hasIconOnly
          renderIcon={Information}
          kind="ghost"
          tooltipPosition="right"
          iconDescription={(
            <>
              {config.probe.channels[index].router_destination !== 0
              && (
              <>
                <strong>
                  Probe
                  {' '}
                  Source:
                </strong>
                {' '}
                {matrix.destinations?.[config.probe.channels[index].router_destination - 1]?.source?.label}
                <br />
              </>
              )}
              <strong>
                Status:
              </strong>
              {' '}
              {probeStats[index]?.active_source ? `Streaming, ${probeStats[index]?.clients} viewer${probeStats[index]?.clients === 1 ? '' : 's'}` : 'No Transport Stream'}
            </>
          )}
        />
      </div>
      {/* </Tooltip> */}
    </>
  );
}

Probe.propTypes = {
  index: PropTypes.number.isRequired,
  slug: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

export default ProbeWrapper;
