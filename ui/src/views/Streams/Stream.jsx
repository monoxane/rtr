import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useAxios from 'axios-hooks';

import {
  Loading,
  TabList,
  Tab,
  Tabs,
  TabPanels,
  TabPanel,
  Button,
  Grid,
  Column,
} from '@carbon/react';

import {
  Information,
} from '@carbon/icons-react';
import {
  gray,
} from '@carbon/colors';

// import useMatrix from '../../hooks/useMatrix.js';
import JSmpegPlayer from '../../common/JSmpegPlayer.jsx';

function ProbeWrapper() {
  return (

    <Probe slug={probeChannel.slug} active={activeTab === index} />
  );
}

function Probe({ index, slug, active }) {
  return (
    <>
      <JSmpegPlayer url={`ws://${document.location.hostname}:${document.location.port}/v1/ws/probe/${slug}`} active={probeStats[slug]?.active_source && active} />
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
                  Destination:
                </strong>
                {' '}
                {matrix.destinations?.[config.probe.channels[index].router_destination - 1]?.label}
                <br />
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
