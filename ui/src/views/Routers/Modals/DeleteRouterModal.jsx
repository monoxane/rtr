import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
} from '@carbon/react';
import { useMutation } from '@apollo/client';

import { DELETE_ROUTER } from '../queries';
import GraphQLError from '../../../components/Errors/GraphQLError.jsx';

function DeleteRouterModal({
  open, setOpen, refresh, router,
}) {
  const [error, setErr] = useState();
  const [deleteRouter] = useMutation(DELETE_ROUTER);

  return (
    <Modal
      open={open}
      onRequestClose={() => {
        setOpen(false);
      }}
      onRequestSubmit={() => {
        setErr();
        deleteRouter({ variables: { id: router.id } }).then(() => {
          setOpen(false);
          refresh();
        }).catch((err) => setErr(err));
      }}
      danger
      modalHeading={(
        <>
          Are you sure you want to delete the router
          {' '}
          <strong>
            {router.label}
          </strong>
          ?
        </>
          )}
      modalLabel="Streams"
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
    >
      This will disconnect from the router and delete all spigot configuration, saved salvo states, and render any routed streams un-routable immediately.
      <br />
      <br />
      The crosspoint state will be preserved on the remote router.
      <GraphQLError error={error} />
    </Modal>
  );
}

DeleteRouterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
};

export default DeleteRouterModal;
