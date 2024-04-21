import React, { useState } from 'react';
// import useAxios from 'axios-hooks';
import PropTypes from 'prop-types';

import {
  Dropdown,
  Grid,
  Column,
  TextInput,
  Button,
  Tile,
} from '@carbon/react';

import {
  Save,
  TrashCan,
} from '@carbon/icons-react';

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

function ProbeChannelConfig({ channel, deleteThisChannel }) {
  const [config, setConfig] = useState({ ...channel });
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <Tile>
      <Grid>
        <Column sm={2} md={4}>
          <h3>{channel.label}</h3>
          <br />
          <Button
            hasIconOnly
            kind={hasChanges ? 'primary' : 'ghost'}
            disabled={!hasChanges}
            iconDescription="Save Channel"
            // onClick={function noRefCheck(){}}
            renderIcon={Save}
          />
          <Button
            hasIconOnly
            kind="ghost"
            iconDescription="Delete Channel"
            onClick={deleteThisChannel}
            renderIcon={TrashCan}
          />
        </Column>
        <Column sm={2} md={4}>
          <TextInput
            id={`${config.id}.label`}
            type="text"
            labelText="Name"
            value={config.label}
            onChange={(e) => {
              setConfig({ ...channel, label: e.target.value });
              setHasChanges(true);
            }}
          />
          <br />
          <TextInput
            id={`${config.id}.router_destination`}
            type="text"
            labelText="Router Destination"
            value={config.router_destination}
            onChange={(e) => {
              setConfig({ ...channel, router_destination: e.target.value });
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
        </Column>
        <Column sm={2} md={4}>
          {config.ingest_type === 'ts-http' && (
            <TextInput
              id={`${config.id}.http_path`}
              type="text"
              labelText="HTTP Path"
              value={config.http_path}
            />
          )}
          {config.ingest_type === 'ts-tcp' && (
            <TextInput
              id={`${config.id}.tcp_port`}
              type="text"
              labelText="TCP Port"
              value={config.tcp_port}
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
  deleteThisChannel: PropTypes.func.isRequired,
};

export default ProbeChannelConfig;
