import React from 'react';

import PropTypes from 'prop-types';

import {
  ToastNotification,
} from '@carbon/react';

const GraphQLError = function GraphQLError({ error }) {
  if (!error) {
    return (null);
  }

  return (
    <ToastNotification
      lowContrast
      hideCloseButton
      notificationType="toast"
      role="alert"
      style={{
        marginTop: '1em',
        marginBottom: '.5rem',
        minWidth: '55rem',
      }}
      title="GraphQL Errors"
      subtitle={(
        <>
          {error.graphQLErrors.map((err) => (
            <>
              <br />
              <span>
                {err.path}
                :
                {' '}
                {err.message}
              </span>
            </>
          ))}
          {error.networkError?.result.errors.map((err) => (
            <>
              <br />
              <span>
                {err.message}
                :
                {' '}
                {err.path.join('.')}
              </span>
            </>
          ))}
        </>
        )}
    />
  );
};

GraphQLError.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.object.isRequired,
};

export default GraphQLError;
