import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import {
  purple,
  gray,
} from '@carbon/colors';

import {
  Button,
  useContextMenu,
  Menu,
  MenuItem,
} from '@carbon/react';

function Source({
  source, onClick, onEdit, selected = false,
}) {
  const el = useRef(null);
  const menuProps = useContextMenu(el);

  return (
    <>
      <Button
        ref={el}
        onClick={onClick}
        style={{
          minWidth: '10px',
          padding: '10px',
          width: '100%',
          display: 'table',
          marginBottom: '1px',
          background: selected ? purple[60] : gray[70],
        }}
        size="xl"
      >
        <>
          <strong>{source.label}</strong>
          <br />
          {source.source?.label}
        </>
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
};

Source.defaultProps = {
  selected: false,
};

export default Source;
