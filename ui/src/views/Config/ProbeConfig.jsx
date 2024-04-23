import React, { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';

import {
  Stack,
  Grid,
  Column,
  Loading,
  Form,
  // Button,
} from '@carbon/react';

// import {
//   Add,
// } from '@carbon/icons-react';

import ProbeChannelConfig from './ProbeChannelConfig.jsx';

function ProbeConfig() {
  const [{ data: config, loading: configLoading, error: configError }, refresh] = useAxios(
    '/v1/config',
  );

  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (config) {
      setChannels(config.probe.channels);
    }
  }, [config]);

  return (
    <>
      {(configLoading) && <Loading withOverlay />}
      {(configError) && JSON.stringify({ configError })}
      { !configLoading && !configError
      && (
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <Form>
            <Stack gap={7}>
              {channels.map((channel, index) => (
                <ProbeChannelConfig
                  key={channel.id}
                  channel={channel}
                  deleteThisChannel={() => {
                    const newChannels = [...channels];
                    newChannels.splice(index, 1);
                    setChannels(newChannels);
                  }}
                  refresh={refresh}
                />
              ))}
              {/* <Button disabled renderIcon={Add} onClick={() => setChannels([...channels, { label: 'New Channel', new: true, id: channels.length + 1 }])}>
                Add Probe Channel
                {' '}
              </Button> */}
            </Stack>
          </Form>
        </Column>
      </Grid>
      )}
    </>
  );
}

export default ProbeConfig;
