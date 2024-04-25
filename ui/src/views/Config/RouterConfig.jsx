import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';

import {
  Stack,
  Dropdown,
  Grid,
  Column,
  TextInput,
  Button,
  DefinitionTooltip,
  Tile,
  ToastNotification,
} from '@carbon/react';

import configContext from '../../context/configContext';

const RouterProviders = [
  'Ross NK-IPS',
  // 'Blackmagic Design',
  // 'SW-P-08',
];

const RouterModels = {
  'Ross NK-IPS': [
    'NK-3G72',
    'NK-3G64',
    'NK-3G34',
    'NK-3G16',
    'NK-3G16-RCP',
    'NK-3G164',
    'NK-3G164-RCP',
  ],
};

const ProviderSettings = {
  'Ross NK-IPS': {
    port: 9000,
    address: 254,
    editable: false,
  },
};

function RouterConfig() {
  const { config, refreshConfig } = useContext(configContext);

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Tile>
          <Stack gap={4}>
            <h3>Router Configuration</h3>
            <RouterConfigForm data={config.router} refresh={refreshConfig} />
          </Stack>
        </Tile>
      </Column>
    </Grid>

  );
}

function RouterConfigForm({ data, refresh }) {
  const [router, setRouter] = useState(data);
  const [status, setStatus] = useState({ kind: '' });

  const submit = () => {
    setStatus({ kind: 'submitting' });
    axios.put('/v1/config/router', router)
      .then(() => {
        setStatus({ kind: 'success' });
        refresh();
      })
      .catch((err) => {
        setStatus({ kind: 'error', message: err.message });
      });
  };

  useEffect(() => {
    if (router.provider === 'Ross NK-IPS' && router.address === 0) {
      setRouter({ ...router, address: ProviderSettings['Ross NK-IPS'].address });
    }

    if (router.provider === 'Ross NK-IPS' && router.port === null) {
      setRouter({ ...router, address: ProviderSettings['Ross NK-IPS'].port });
    }
  }, [router]);

  return (
    <Stack gap={4}>
      <Grid>
        <Column sm={4} md={8}>
          <Dropdown
            id="provider"
            titleText="Router Provider"
            label="Select your Router Provider"
            initialSelectedItem={router.provider}
            items={RouterProviders}
            onChange={((e) => setRouter({ ...router, provider: e.selectedItem }))}
          />
        </Column>
        <Column sm={4} md={8}>
          <Dropdown
            id="model"
            titleText="Router Model"
            label="Select your Router Model"
            initialSelectedItem={router.model}
            items={RouterModels[router.provider]}
            disabled={!router.provider}
            onChange={((e) => setRouter({ ...router, model: e.selectedItem }))}
          />
        </Column>
      </Grid>
      <Grid>
        <Column sm={2} md={4}>
          <TextInput
            id="label"
            type="text"
            labelText="Name"
            helperText="A user friendly name to show in rtr"
            value={router.label}
            onChange={(e) => setRouter({ ...router, label: e.target.value })}
          />
        </Column>
        <Column sm={2} md={4}>
          <TextInput
            id="ip"
            type="text"
            labelText="IP"
            helperText="IP Address of the Router or Protocol Gateway"
            value={router.ip}
            onChange={(e) => setRouter({ ...router, ip: e.target.value })}
          />
        </Column>
        <Column sm={2} md={4}>
          <TextInput
            id="port"
            type="text"
            labelText="Port"
            value={ProviderSettings[router.provider]?.port}
            disabled={!router.provider || ProviderSettings[router.provider]?.editable === false}
            onChange={(e) => setRouter({ ...router, port: e.target.value })}
          />
        </Column>
        <Column sm={2} md={4}>
          <TextInput
            id="address"
            type="text"
            labelText="Bus Address"
            helperText={(
              <DefinitionTooltip openOnHover definition="Some router systems require specifying an internal bus address">
                Optional
              </DefinitionTooltip>
            )}
            disabled={router.provider !== 'Ross NK-IPS'}
            value={router.address}
            onChange={(e) => setRouter({ ...router, address: e.target.value })}
          />
        </Column>
      </Grid>
      {status.kind === 'error' && (
      <ToastNotification
        hideCloseButton
        kind={status.kind}
        lowContrast
        role="alert"
        caption={status.message}
        timeout={0}
        title="Unable to save Router Configuration"
      />
      )}
      <Button
        onClick={submit}
        disabled={status.kind === 'submitting'}
      >
        {status.kind === 'submitting' ? 'Saving' : 'Save'}
      </Button>
    </Stack>
  );
}

RouterConfigForm.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  refresh: PropTypes.func.isRequired,
};

export default RouterConfig;
