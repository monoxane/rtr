import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
} from '@carbon/react';

import { getAxiosPrivate } from '../../../hooks/useAxiosPrivate';

function DeleteStreamModal({
  open, setOpen, refresh, stream,
}) {
  const axios = getAxiosPrivate();

  return (
    <Modal
      open={open}
      onRequestClose={() => {
        setOpen(false);
      }}
      onRequestSubmit={() => {
        axios.delete(`/v1/api/streams/${stream.id}`)
          .then(() => {
            refresh();
          });
        setOpen(false);
      }}
      danger
      modalHeading={(
        <>
          Are you sure you want to delete the stream
          {' '}
          <strong>
            {stream.label}
            {' '}
            (
            {stream.slug}
            )
          </strong>
          ?
        </>
          )}
      modalLabel="Streams"
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
    >
      This will stop processing the stream and remove it from view immediately.
    </Modal>
  );
}

DeleteStreamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  stream: PropTypes.object.isRequired,
};

export default DeleteStreamModal;
