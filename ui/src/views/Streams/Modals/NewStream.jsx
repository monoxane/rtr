import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Modal,
  TextInput,
  Stack,
  Toggle,
} from '@carbon/react';

import {
  Add,
} from '@carbon/icons-react';

import { getAxiosPrivate } from '../../../hooks/useAxiosPrivate.js';

import ModalStateManager from '../../../common/ModalStateManager.jsx';

function NewStream({ refresh }) {
  const button = useRef();

  return (
    <ModalStateManager renderLauncher={({
      setOpen,
    }) => (
      <Button renderIcon={Add} ref={button} onClick={() => setOpen(true)}>
        New Stream
      </Button>
    )}
    >
      {({
        open,
        setOpen,
      }) => (
        <NewStreamModal open={open} setOpen={setOpen} launcherButtonRef={button} refresh={refresh} />
      )}
    </ModalStateManager>
  );
}

NewStream.propTypes = {
  refresh: PropTypes.func.isRequired,
};

function NewStreamModal({
  open, setOpen, launcherButtonRef, refresh,
}) {
  const [newStream, setNewStream] = useState({
    label: '', slug: '', destination_id: null, is_routable: false,
  });

  const axios = getAxiosPrivate();

  return (
    <Modal
      launcherButtonRef={launcherButtonRef}
      modalHeading="Create a new Stream"
      modalLabel="Streams"
      primaryButtonText="Create"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        axios.post('/v1/api/streams', newStream)
          .then(() => {
            refresh();
            setOpen(false);
          });
      }}
      onRequestClose={() => {
        setOpen(false);
        setTimeout(() => {
          setNewStream({
            label: '', slug: '', destination_id: null, is_routable: false,
          });
        }, 250);
      }}
    >
      <Stack gap={4}>
        <TextInput
          id="label"
          type="text"
          placeholder="Program A"
          labelText="Name"
          required
          value={newStream.label}
          onChange={(e) => setNewStream({ ...newStream, label: e.target.value })}
        />
        <TextInput
          id="slug"
          type="text"
          placeholder="pgm"
          labelText="Slug"
          helperText="The Slug is used in the Stream ingest URL"
          required
          value={newStream.slug}
          onChange={(e) => setNewStream({ ...newStream, slug: e.target.value })}
        />
        <Toggle
          labelText="Allow users to route this Stream"
          labelA="Stream is Not Routable"
          labelB="Stream is Routable"
          value={newStream.is_routable}
          disabled
          id="is_routable"
          onToggle={(toggled) => setNewStream({ ...newStream, is_routable: toggled })}
        />
      </Stack>
    </Modal>
  );
}

NewStreamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  launcherButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  refresh: PropTypes.func.isRequired,
};

export default NewStream;
