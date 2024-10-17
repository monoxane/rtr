import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Modal,
  TextInput,
} from '@carbon/react';

function EditSpigotModal({
  IO, type, open, setOpen,
}) {
  const [data, setData] = useState(IO);

  useEffect(() => {
    setData(IO);
  }, [IO]);

  const submit = () => {
    axios.put(`/v1/config/${type}/${IO.id}`, { label: data.label, description: data.description })
      .then(() => {
        setOpen(false);
      });
  };

  return (
    <Modal
      modalHeading={IO?.label}
      modalLabel={`Edit ${type}`}
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      open={open}
      onRequestClose={() => setOpen(false)}
      onRequestSubmit={submit}
    >
      <TextInput
        data-modal-primary-focus
        id="label"
        labelText="Label"
        placeholder="e.g. VTR1"
        style={{
          marginBottom: '1rem',
        }}
        value={data?.label}
        onChange={(e) => setData({ ...data, label: e.target.value })}
      />
      <TextInput
        data-modal-primary-focus
        id="description"
        labelText="Description"
        placeholder="e.g. Primary Shotbox"
        style={{
          marginBottom: '1rem',
        }}
        value={data?.description}
        onChange={(e) => setData({ ...data, description: e.target.value })}
      />
    </Modal>
  );
}

EditSpigotModal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  IO: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default EditSpigotModal;
