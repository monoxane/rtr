import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  TextInput,
  Stack,
  Toggle,
  ComboBox,
} from '@carbon/react';

import { useMutation, useQuery } from '@apollo/client';

import { UPDATE_STREAM, LIST_ROUTERS } from '../queries.js';

import streamPropTypes from '../propTypes';

import GraphQLError from '../../../components/Errors/GraphQLError.jsx';

function EditStreamModal({
  open, setOpen, launcherButtonRef, refresh, stream,
}) {
  const [streamData, setStreamData] = useState(stream);
  const [error, setErr] = useState();

  const [updateStream] = useMutation(UPDATE_STREAM);

  const {
    data,
  } = useQuery(LIST_ROUTERS);

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
              destination: streamData.destination?.id || null,
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
        <ComboBox
          id="router"
          titleText="Router"
          placeholder="Select a Router"
          helperText="The Router this Stream is attached to"
          disabled={!data?.routers}
          items={data?.routers || []}
          selectedItem={streamData?.router}
          onChange={(e) => setStreamData({ ...streamData, router: e.selectedItem })}
        />
        <ComboBox
          id="destination"
          titleText="Router Destination"
          placeholder="Select a Destination"
          helperText="The Router Destination feeding this stream"
          disabled={!streamData.router}
          items={streamData?.router?.destinations || []}
          selectedItem={streamData?.destination}
          onChange={(e) => setStreamData({ ...streamData, destination: e.selectedItem })}
          direction="up"
        />
        <Toggle
          labelText="Allow users to route this Stream"
          labelA="Stream is Not Routable"
          labelB="Stream is Routable"
          value={streamData.isRoutable}
          id="is_routable"
          onToggle={(toggled) => setStreamData({ ...streamData, isRoutable: toggled })}
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
