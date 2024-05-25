import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  TableRow,
  TableCell,
  TextInput,
} from '@carbon/react';

function SpigotConfig({ spigot, type }) {
  const [spigotData, setSpigotData] = useState(spigot);

  const updateLabel = (newLabel) => {
    setSpigotData({ ...spigotData, label: newLabel });
  };

  const updateDescription = (newDescription) => {
    setSpigotData({ ...spigotData, description: newDescription });
  };

  useEffect(() => {
    setSpigotData(spigot);
  }, [spigot]);

  const submit = () => {
    if (spigotData.label !== spigot.label || spigotData.description !== spigot.description) {
      axios.put(`/v1/config/${type}/${spigot.id}`, { label: spigotData.label, description: spigotData.description })
        .then(() => {
          document.activeElement.blur();
        });
    }
  };

  return (
    <TableRow className="spigot-row">
      <TableCell>
        {type === 'destination' && 'Out'}
        {type === 'source' && 'In'}
        &nbsp;
        {spigotData.id}
      </TableCell>
      <TableCell>
        <TextInput
          id={`${spigotData.id}.label`}
          type="text"
          size="sm"
          kind="ghost"
          value={spigotData.label}
          onChange={(e) => updateLabel(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { submit(); }
          }}
        />
      </TableCell>
      <TableCell>
        <TextInput
          id={`${spigotData.id}.description`}
          type="text"
          size="sm"
          kind="ghost"
          value={spigotData.description}
          onChange={(e) => updateDescription(e.target.value)}
          onBlur={submit}
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { submit(); }
          }}
        />
      </TableCell>
    </TableRow>
  );
}

SpigotConfig.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  spigot: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

export default SpigotConfig;
