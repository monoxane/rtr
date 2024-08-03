import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  TextInput,
  Stack,
} from '@carbon/react';
import { useMutation, gql } from '@apollo/client';

import userPropType from './propTypes';

const UPDATE_PASSWORD = gql`mutation updatePassword($id:Int!, $password: String!) {
  updateUserPassword(id:$id, password: $password)
}`;

function ChangePasswordModal({
  open, setOpen, user,
}) {
  const [userData, setUserData] = useState({ new: '', confirm: '' });

  const [updatePassword] = useMutation(UPDATE_PASSWORD);

  return (
    <Modal
      modalHeading={(
        <>
          Set password for
          {' '}
          <strong>
            {user.real_name || user.username}
          </strong>
        </>
      )}
      modalLabel="Users"
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        updatePassword({ variables: { id: user.id, password: userData.new } }).then(() => {
          setOpen(false);
          setTimeout(() => {
            setUserData({
              new: '', confirm: '',
            });
          }, 250);
        });
      }}
      onRequestClose={() => {
        setOpen(false);
        setTimeout(() => {
          setUserData({
            new: '', confirm: '',
          });
        }, 250);
      }}
    >
      <Stack gap={4}>
        <TextInput
          id="password"
          type="password"
          required
          placeholder="Enter new password"
          labelText="New Password"
          value={userData.new}
          onChange={(e) => setUserData({ ...userData, new: e.target.value })}
        />
        <TextInput
          id="confirm-password"
          type="password"
          required
          placeholder="Confirm password"
          labelText="Confirm New Password"
          value={userData.confirm}
          invalid={(userData.new && userData.confirm && (userData.new !== userData.confirm)) === true}
          invalidText="Password does not match"
          onChange={(e) => setUserData({ ...userData, confirm: e.target.value })}
        />
      </Stack>
    </Modal>
  );
}

ChangePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  user: PropTypes.shape(userPropType).isRequired,
};

export default ChangePasswordModal;
