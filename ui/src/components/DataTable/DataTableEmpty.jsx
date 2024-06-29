import React from 'react';

import PropTypes from 'prop-types';

import {
  Tile,
  Stack,
} from '@carbon/react';

import {
  AddDocument,
} from '@carbon/pictograms-react';

const DataTableEmpty = function DataTableEmpty({ title, description, action }) {
  return (
    <Tile style={{ padding: '4em', marginTop: '2px' }}>
      <Stack gap={4}>
        <AddDocument />
        <h1>
          {title}
        </h1>
        <p>
          {description}
        </p>
        {action}
      </Stack>
    </Tile>
  );
};

DataTableEmpty.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node.isRequired,
};

export default DataTableEmpty;
