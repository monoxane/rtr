import React, { useState } from 'react';
// import useAxios from 'axios-hooks';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Dropdown,
  Grid,
  Column,
  TextInput,
  Button,
  Tile,
  Stack,
} from '@carbon/react';

import {
  Save,
  // TrashCan,
} from '@carbon/icons-react';

import useMatrix from '../../hooks/useMatrix';

const IngestLut = {
  'ts-http': {
    label: 'MPEG TS - HTTP',
    value: 'ts-http',
  },
  'ts-tcp': {
    label: 'MPEG TS - TCP',
    value: 'ts-tcp',
  },
};

function ProbeChannelConfig({ channel, refresh }) {
  const [config, setConfig] = useState({ ...channel });
  const [hasChanges, setHasChanges] = useState(false);

  const {
    probeStats,
  } = useMatrix();

  const submit = () => {
    axios.put(`/v1/config/probe/${channel.slug}`, config)
      .then(() => {
        refresh();
      });
  };

  return (
    <Tile>
      <Grid>
        <Column sm={2} md={4}>
          <Stack gap={2}>
            <h3>{channel.label}</h3>
            <span>
              <strong>Ingest: </strong>
              {probeStats[channel.index]?.active_source ? 'Active' : 'Idle'}
            </span>
            <span>
              <strong>Viewers: </strong>
              {probeStats[channel.index]?.clients}
            </span>
            <Button
              hasIconOnly
              kind={hasChanges ? 'primary' : 'ghost'}
              disabled={!hasChanges}
              iconDescription="Save Channel"
              onClick={submit}
              renderIcon={Save}
            />
          </Stack>
          {/* <Button
            hasIconOnly
            kind="ghost"
            iconDescription="Delete Channel"
            onClick={deleteThisChannel}
            renderIcon={TrashCan}
            disabled
          /> */}
        </Column>
        <Column sm={2} md={4}>
          <TextInput
            id={`${config.id}.label`}
            type="text"
            labelText="Name"
            value={config.label}
            onChange={(e) => {
              setConfig({ ...config, label: e.target.value });
              setHasChanges(true);
            }}
          />
          <br />
          <TextInput
            id={`${config.id}.slug`}
            type="text"
            labelText="Slug"
            helperText="Unique Identifier for this Channel's Stream"
            value={config.slug}
            onChange={(e) => {
              setConfig({ ...config, slug: e.target.value.replace(' ', '-') });
              setHasChanges(true);
            }}
          />
        </Column>
        <Column sm={2} md={4}>
          <TextInput
            id={`${config.id}.router_destination`}
            type="text"
            labelText="Router Destination"
            helperText="Set to 0 to teat as an non-routed external source"
            value={config.router_destination}
            onChange={(e) => {
              setConfig({ ...config, router_destination: Number(e.target.value) });
              setHasChanges(true);
            }}
          />
        </Column>
        <Column sm={2} md={4}>
          <Dropdown
            id={`${config.id}.ingest_type`}
            titleText="Ingest Type"
            initialSelectedItem={IngestLut[config.ingest_type]}
            itemToString={(item) => (item ? item.label : item)}
            items={[
              {
                label: 'MPEG TS - HTTP',
                value: 'ts-http',
              },
              {
                label: 'MPEG TS - TCP',
                value: 'ts-tcp',
              },
            ]}
            onChange={(e) => setConfig({ ...config, ingest_type: e.selectedItem.value })}
          />
          <br />
          {config.ingest_type === 'ts-http' && (
          <TextInput
            id={`${config.id}.http_path`}
            type="text"
            labelText="HTTP Path"
            value={config.http_path}
            disabled
          />
          )}
          {config.ingest_type === 'ts-tcp' && (
          <TextInput
            id={`${config.id}.tcp_port`}
            type="text"
            labelText="TCP Port"
            value={config.tcp_port}
            onChange={(e) => {
              setConfig({ ...config, tcp_port: Number(e.target.value) });
              setHasChanges(true);
            }}
          />
          )}
        </Column>
      </Grid>
    </Tile>
  );
}

ProbeChannelConfig.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object.isRequired,
  refresh: PropTypes.func.isRequired,
};

export default ProbeChannelConfig;
