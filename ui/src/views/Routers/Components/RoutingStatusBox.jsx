import React from 'react';
import PropTypes from 'prop-types';

import {
  Tile,
  Column,
  Layer,
} from '@carbon/react';

function RoutingStatusBox({
  renderIcon, label, description, number,
}) {
  return (
    <Column sm={2} md={4} lg={6}>
      <Layer>
        <Tile>
          <div style={{ display: 'inline-flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ flexGrow: 1 }}>
              {renderIcon}
            </div>
            <div style={{
              width: '100%', marginLeft: '12px', marginRight: '12px', flexGrow: 3,
            }}
            >
              {label}
              <br />
              <em title={description}>{description}</em>
            </div>
            <div style={{ width: '36px', flexGrow: 1, right: 0 }}>
              <em style={{ fontSize: '2em' }} className="text-mono">
                {number}
              </em>
            </div>
          </div>
        </Tile>
      </Layer>
    </Column>
  );
}

RoutingStatusBox.propTypes = {
  renderIcon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  number: PropTypes.number,
};

RoutingStatusBox.defaultProps = {
  description: '',
  number: null,
};

export default RoutingStatusBox;
