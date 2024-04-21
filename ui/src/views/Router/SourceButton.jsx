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
  Modal,
  TextInput,
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

function EditSourceModal({ source, open, setOpen }) {
  return (
    <Modal
      modalHeading={source?.label}
      modalLabel="Edit Source"
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      open={open}
      onRequestClose={() => setOpen(false)}
    >
      <TextInput
        data-modal-primary-focus
        id="label"
        labelText="Label"
        placeholder="e.g. VTR1"
        style={{
          marginBottom: '1rem',
        }}
      />
      <TextInput
        data-modal-primary-focus
        id="description"
        labelText="Description"
        placeholder="e.g. Primary Shotbox Playout"
        style={{
          marginBottom: '1rem',
        }}
      />
    </Modal>
  );
}

EditSourceModal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  source: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export { Source, EditSourceModal };
