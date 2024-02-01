import React from 'react';
import useAxios from 'axios-hooks';

import {
  Stack,
  Dropdown,
  Grid,
  Column,
  TextInput,
  Loading,
  Form,
  FormGroup,
  Button,
} from '@carbon/react';

const RouterProviders = [
  'Ross NK-IPS',
  'Blackmagic Design',
  'SW-P-08',
];
const RouterModels = [
  'NK-3G72',
  'NK-3G64',
  'NK-3G34',
  'NK-3G16',
  'NK-3G16-RCP',
  'NK-3G164',
  'NK-3G164-RCP',
];

function Config() {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config',
  );

  return (
    <>
      {(configLoading) && <Loading withOverlay />}
      {(configError) && JSON.stringify({ configError })}
      <Grid>
        <Column sm={4}>
          <h2>Configuration</h2>
          <br />
          <Form>
            <Stack gap={7}>
              <FormGroup>
                <Stack gap={4}>
                  <Dropdown id="provider" titleText="Router Provider" initialSelectedItem={RouterProviders[0]} items={RouterProviders} />
                  <Dropdown id="model" titleText="Router Model" initialSelectedItem={config.router.model} items={RouterModels} />
                </Stack>
              </FormGroup>

              <FormGroup>
                <Stack gap={4}>
                  <TextInput id="ip" type="text" labelText="IP" helperText="IP Address of the Router or Interface" value={config.router.ip} />
                  <TextInput id="address" type="text" labelText="Bus Address" helperText="Optional Bus Address of the Router" value={config.router.address} />
                </Stack>
              </FormGroup>

              <Button type="submit">
                Save
              </Button>
            </Stack>
          </Form>
        </Column>
      </Grid>
    </>
  );
}

export default Config;
