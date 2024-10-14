import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  useContextMenu,
  Menu,
  MenuItem,
} from '@carbon/react';
import {
  purple,
  gray,
  red,
} from '@carbon/colors';

function Source({
  source, onClick, onEdit, selected = false, routed = false,
}) {
  const el = useRef(null);
  const menuProps = useContextMenu(el);

  const getBackground = () => {
    if (routed) return purple[60];
    if (selected) return red[60];
    return gray[70];
  };

  return (
    <>
      <Button
        id={`source-${source.id}`}
        ref={el}
        onClick={onClick}
        style={{
          background: getBackground(),
        }}
        size="xl"
        className="ioButton"
      >
        <strong title={`Input ${source.index} - ${source.label}`}>{source.label}</strong>
      </Button>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Menu {...menuProps}>
        <MenuItem onClick={onEdit} label="Edit" />
      </Menu>
    </>
  );
}

Source.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  source: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  routed: PropTypes.bool,
};

Source.defaultProps = {
  selected: false,
  routed: false,
};

export default Source;
