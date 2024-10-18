import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  TextInput,
  NumberInput,
} from '@carbon/react';

import { useMutation } from '@apollo/client';

import { UPDATE_DESTINATION, UPDATE_SOURCE } from '../queries.js';

import GraphQLError from '../../../components/Errors/GraphQLError.jsx';

function EditSpigotModal({
  spigot, type, open, setOpen, refresh,
}) {
  const [data, setData] = useState(spigot);
  const [error, setErr] = useState();

  useEffect(() => {
    setData(spigot);
  }, [spigot]);

  const [updatedDestination] = useMutation(UPDATE_DESTINATION);
  const [updateSource] = useMutation(UPDATE_SOURCE);

  const submit = () => {
    setErr();
    switch (type) {
      case 'destinations':
        updatedDestination({
          variables: {
            destination: {
              id: data.id, label: data.label, description: data.description, tallyAddress: data.tallyAddress,
            },
          },
        }).then(() => {
          refresh();
          setOpen(false);
        }).catch((err) => {
          setErr(err);
        });
        break;
      case 'sources':
        updateSource({
          variables: {
            source: {
              id: data.id, label: data.label, description: data.description, tallyAddress: data.tallyAddress, umdText: data.umdText,
            },
          },
        }).then(() => {
          refresh();
          setOpen(false);
        }).catch((err) => {
          setErr(err);
        });
        break;
      default:
    }
  };

  return (
    <Modal
      modalHeading={spigot?.label}
      modalLabel="Edit Spigots"
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
        id="description"
        labelText="Description"
        placeholder="e.g. Primary Shotbox"
        style={{
          marginBottom: '1rem',
        }}
        value={data?.description || ''}
        onChange={(e) => setData({ ...data, description: e.target.value })}
      />
      {type === 'sources' && (
        <TextInput
          id="umd"
          labelText="UMD Text"
          placeholder="CAMERA 1"
          style={{
            marginBottom: '1rem',
          }}
          value={data?.umdText}
          onChange={(e) => setData({ ...data, umdText: e.target.value })}
        />
      )}
      <NumberInput
        id="tallyAddress"
        label="Tally Address"
        placeholder={`e.g. ${data?.index}`}
        value={data?.tallyAddress}
        min={0}
        max={256}
        onChange={(e) => { setData({ ...data, tallyAddress: e.target.value }); }}
      />
      <GraphQLError error={error} />
    </Modal>
  );
}

EditSpigotModal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  spigot: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

export default EditSpigotModal;
