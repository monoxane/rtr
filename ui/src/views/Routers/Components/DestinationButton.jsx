import { useParams, useNavigate } from 'react-router-dom';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  useContextMenu,
  Menu, MenuItem,
} from '@carbon/react';

import {
  blue,
  gray,
} from '@carbon/colors';

function Destination({
  destination, onClick, onEdit, selected = false, disabled = false,
}) {
  const el = useRef(null);
  const menuProps = useContextMenu(el);
  const navigate = useNavigate();

  const { routerId } = useParams();

  return (
    <>
      <Button
        ref={el}
        onClick={onClick}
        style={{
          background: selected ? blue[60] : gray[70],
        }}
        className="ioButton"
        disabled={disabled}
      >
        <>
          <strong title={`Output ${destination.index} - ${destination.label}`}>
            {destination.label}
          </strong>
          <br />
          <em className="source" title={destination.routedSource?.label}>{destination.routedSource?.label}</em>
        </>
      </Button>
      {!disabled
      && (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Menu {...menuProps}>
          <MenuItem onClick={onEdit} label="Edit" />
          <MenuItem label="Solo" onClick={() => navigate(`/routers/${routerId}/control/${destination.index}`)} />
        </Menu>
      )}
    </>
  );
}

Destination.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  destination: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
};

Destination.defaultProps = {
  selected: false,
  disabled: false,
};

export default Destination;
