import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from '@carbon/react';

const Time = function Time({ time, since }) {
  const parsedTime = new Date();
  const asLocale = parsedTime.toLocaleDateString('en-AU');

  if (!since) {
    return (<span>{asLocale}</span>);
  }

  if (since) {
    if (time === '' || time === null) {
      return <em>Never</em>;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.parse(time);

    const diffDays = Math.round(Math.abs((parsedTime - now) / oneDay));

    switch (diffDays) {
      case 0:
        return (
          <Tooltip label={asLocale}>
            <span>Today</span>
          </Tooltip>
        );
      case 1:
        return (
          <Tooltip label="Close">
            <span>Yesterday</span>
          </Tooltip>
        );
      default:
        return (
          <Tooltip label="Close">
            <span>
              {diffDays}
              {' '}
              Days Ago
            </span>
          </Tooltip>
        );
    }
  }
};

Time.propTypes = {
  time: PropTypes.string.isRequired,
  since: PropTypes.bool,
};

Time.defaultProps = {
  since: false,
};

export default Time;
