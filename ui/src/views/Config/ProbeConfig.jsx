import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import {
  Stack,
  Grid,
  Column,
  Button,
} from '@carbon/react';

import {
  Add,
} from '@carbon/icons-react';

import ProbeChannelConfig from './ProbeChannelConfig.jsx';

import configContext from '../../context/configContext';

function ProbeConfig() {
  const { config, refreshConfig } = useContext(configContext);

  const [channels, setChannels] = useState([]);

  useEffect(() => {
    setChannels(config.probe.channels);
  }, [config]);

  const newChannel = () => {
    axios.post('/v1/config/probe')
      .then(() => {
        refreshConfig();
      });
  };

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Stack gap={6}>
          <h2>Probe Configuration</h2>
          {channels.length === 0 && (
            <p>There are no Probe channels configured.</p>
          )}
          {channels.map((channel, index) => (
            <ProbeChannelConfig
              key={channel.slug}
              channel={{ ...channel, index }}
              refresh={refreshConfig}
            />
          ))}
          <Button
            renderIcon={Add}
            onClick={newChannel}
          >
            Add Probe Channel
            {' '}
          </Button>
        </Stack>
      </Column>
    </Grid>
  );
}

export default ProbeConfig;
