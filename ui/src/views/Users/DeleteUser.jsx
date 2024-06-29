import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
} from '@carbon/react';

import { getAxiosPrivate } from '../../hooks/useAxiosPrivate';
import userPropType from './propTypes';

function DeleteUserModal({
  open, setOpen, refresh, user,
}) {
  const axios = getAxiosPrivate();

  return (
    <Modal
      open={open}
      onRequestClose={() => {
        setOpen(false);
      }}
      onRequestSubmit={() => {
        axios.delete(`/v1/api/users/${user.id}`)
          .then(() => {
            refresh();
          });
        setOpen(false);
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
    </Modal>
  );
}

DeleteUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  user: PropTypes.shape(userPropType).isRequired,
};

export default DeleteUserModal;
