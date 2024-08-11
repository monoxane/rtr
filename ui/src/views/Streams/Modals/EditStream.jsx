import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  TextInput,
  Stack,
  Toggle,
} from '@carbon/react';

import { useMutation } from '@apollo/client';

import { UPDATE_STREAM } from '../queries.js';

import streamPropTypes from '../propTypes';

import GraphQLError from '../../../components/Errors/GraphQLError.jsx';

function EditStreamModal({
  open, setOpen, launcherButtonRef, refresh, stream,
}) {
  const [streamData, setStreamData] = useState(stream);
  const [error, setErr] = useState();

  const [updateStream] = useMutation(UPDATE_STREAM);

  useEffect(() => {
    if (!open) {
      setStreamData(stream);
    }
  }, [stream, open]);

  return (
    <Modal
      launcherButtonRef={launcherButtonRef}
      modalHeading="Update Stream"
      modalLabel="Streams"
      primaryButtonText="Update"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        setErr();
        const payload = {
          variables: {
            id: stream.id,
            stream: {
              label: streamData.label,
              slug: streamData.slug,
              isRoutable: streamData.isRoutable,
              destination: streamData.destination,
            },
          },
        };
        updateStream(payload).then(() => {
          refresh();
          setOpen(false);
        }).catch((err) => {
          setErr(err);
        });
      }}
    >
      <Stack gap={4}>
        <TextInput
          id="label"
          type="text"
          placeholder="Program A"
          labelText="Name"
          required
          value={streamData.label}
          onChange={(e) => setStreamData({ ...streamData, label: e.target.value })}
        />
        <TextInput
          id="slug"
          type="text"
          placeholder="pgm"
          labelText="Slug"
          helperText="You cannot update the Slug of an existing Stream"
          required
          disabled
          value={streamData.slug}
        />
        <Toggle
          labelText="Allow users to route this Stream"
          labelA="Stream is Not Routable"
          labelB="Stream is Routable"
          value={streamData.isRoutable}
          disabled
          id="is_routable"
          onToggle={(toggled) => setStreamData({ ...streamData, is_routable: toggled })}
        />
        <GraphQLError error={error} />
      </Stack>
    </Modal>
  );
}

EditStreamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  launcherButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  stream: streamPropTypes.isRequired,
  refresh: PropTypes.func.isRequired,
};

export default EditStreamModal;
