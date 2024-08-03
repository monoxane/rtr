import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
} from '@carbon/react';
import { useMutation, gql } from '@apollo/client';

import GraphQLError from '../../components/Errors/GraphQLError.jsx';
import userPropType from './propTypes';

const DEACTIVATE_USER = gql`mutation deactivateUser($id:Int!) {
  deactivateUser(id:$id)
}`;

function DeactivateUserModal({
  open, setOpen, refresh, user,
}) {
  const [error, setErr] = useState();
  const [deactivateUser] = useMutation(DEACTIVATE_USER);

  return (
    <Modal
      open={open}
      onRequestClose={() => {
        setOpen(false);
      }}
      onRequestSubmit={() => {
        setErr();
        deactivateUser({ variables: { id: user.id } }).then(() => {
          setOpen(false);
          refresh();
        }).catch((err) => setErr(err));
      }}
      danger
      modalHeading={(
        <>
          Are you sure you want to deactivate the account for
          {' '}
          <strong>{user.real_name || user.username}</strong>
          ?
        </>
          )}
      modalLabel="Users"
      primaryButtonText="Deactivate"
      secondaryButtonText="Cancel"
    >
      They will no longer be able to log in or access rtr.
      <GraphQLError error={error} />
    </Modal>
  );
}

DeactivateUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  user: PropTypes.shape(userPropType).isRequired,
};

export default DeactivateUserModal;
