import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  TextInput,
  Dropdown,
  Stack,
} from '@carbon/react';

import { useMutation, gql } from '@apollo/client';

import GraphQLError from '../../components/Errors/GraphQLError.jsx';

const UPDATE_USER = gql`mutation updateUser($id:Int!, $user: UserUpdate!) {
  updateUser(id:$id, user: $user) {id}
}`;

function EditUserModal({
  open, setOpen, launcherButtonRef, refresh, user, roles,
}) {
  const [userData, setUserData] = useState(user);
  const [error, setErr] = useState();

  const [updateUser] = useMutation(UPDATE_USER);

  useEffect(() => {
    if (!open) {
      setUserData(user);
    }
  }, [user, open]);

  return (
    <Modal
      launcherButtonRef={launcherButtonRef}
      modalHeading={user.real_name ? `Edit ${user.real_name}'s Account` : `Edit ${user.username}`}
      modalLabel="Users"
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        setErr();
        updateUser({ variables: { id: user.id, user: { username: userData.username, realname: userData.realname, role: userData.role } } }).then(() => {
          refresh();
          setOpen(false);
        }).catch((err) => {
          setErr(err);
        });
      }}
      onRequestClose={() => {
        setOpen(false);
      }}
    >
      <Stack gap={4}>
        <TextInput
          id="real_name"
          type="text"
          placeholder="eg. Grant Petty"
          labelText="Real Name"
          required
          value={userData.realname}
          onChange={(e) => setUserData({ ...userData, realname: e.target.value })}
        />
        <TextInput
          id="username"
          type="text"
          placeholder="user@route.broker"
          labelText="Username"
          required
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        />
        <Dropdown
          id="role"
          titleText="User Role"
          label="Select a Role"
          items={roles}
          direction="top"
          selectedItem={userData.role}
          onChange={(e) => setUserData({ ...userData, role: e.selectedItem })}
        />
        <GraphQLError error={error} />
      </Stack>
    </Modal>
  );
}

EditUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  launcherButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  refresh: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
  roles: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.string).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    error: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};

export default EditUserModal;
