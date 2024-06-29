import React, { useState } from 'react';

import PropTypes from 'prop-types';

import {
  Tile,
  Stack,
  Button,
  Layer,
} from '@carbon/react';

import {
  Warning_01 as Warning,
} from '@carbon/pictograms-react';

const DataTableError = function DataTableError({ resource, error, retry }) {
  const [logVisibility, setLogVisibility] = useState(false);

  return (
    <Tile style={{ padding: '4em', marginTop: '2px' }}>
      <Stack gap={4}>
        <Warning />
        <h1>
          Something&apos;s wrong.
        </h1>
        <p>
          We were unable to fetch
          {' '}
          {resource}
          . Click retry to try again or View Log to learn what happened.
        </p>
        <Button
          kind="primary"
          tabIndex={0}
          onClick={() => retry()}
        >
          Retry
        </Button>
        {!logVisibility
        && (
        <Button
          kind="ghost"
          tabIndex={0}
          onClick={() => setLogVisibility(true)}
        >
          View Log
        </Button>
        )}
        {logVisibility
        && (
          <Layer>
            <Tile>
              <code>
                Name:
                {' '}
                {error.name}
                <br />
                Code:
                {' '}
                {error.code}
                <br />
                Message:
                {' '}
                {error.message}
              </code>
            </Tile>
          </Layer>
        )}
      </Stack>
    </Tile>
  );
};

DataTableError.propTypes = {
  resource: PropTypes.string.isRequired,
  error: PropTypes.shape({
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  retry: PropTypes.func.isRequired,
};

export default DataTableError;
