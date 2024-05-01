import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { useNavigate } from 'react-router-dom';

import {
  blue,
  gray,
} from '@carbon/colors';

import {
  Button,
  useContextMenu,
  Menu, MenuItem,
} from '@carbon/react';

function Destination({
  destination, onClick, onEdit, selected = false,
}) {
  const el = useRef(null);
  const menuProps = useContextMenu(el);
  const navigate = useNavigate();

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
          background: selected ? blue[60] : gray[70],
        }}
        size="xl"
        className="destinationButton"
      >
        <>
          <strong>{destination.label}</strong>
          <br />
          <em className="source" title={destination.source?.label}>{destination.source?.label}</em>
        </>
      </Button>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Menu {...menuProps}>
        <MenuItem onClick={onEdit} label="Edit" />
        <MenuItem label="Solo" onClick={() => navigate(`/router/${destination.id}`)} />
      </Menu>
    </>
  );
}

Destination.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  destination: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

Destination.defaultProps = {
  selected: false,
};

export default Destination;
