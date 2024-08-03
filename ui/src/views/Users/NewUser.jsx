import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Modal,
  TextInput,
  Dropdown,
  Stack,
} from '@carbon/react';

import {
  Add,
} from '@carbon/icons-react';

import { useMutation, gql } from '@apollo/client';

import GraphQLError from '../../components/Errors/GraphQLError.jsx';

import ModalStateManager from '../../common/ModalStateManager.jsx';

const CREATE_USER = gql`mutation createUser($user: UserUpdate!) {
  createUser(user: $user) {id}
}`;

function NewUser({ refresh, roles }) {
  const button = useRef();

  return (
    <ModalStateManager renderLauncher={({
      setOpen,
    }) => (
      <Button renderIcon={Add} ref={button} onClick={() => setOpen(true)}>
        New User
      </Button>
    )}
    >
      {({
        open,
        setOpen,
      }) => (
        <NewUserModal open={open} setOpen={setOpen} launcherButtonRef={button} refresh={refresh} roles={roles} />
      )}
    </ModalStateManager>
  );
}

NewUser.propTypes = {
  refresh: PropTypes.func.isRequired,
  roles: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.string).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    error: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};

function NewUserModal({
  open, setOpen, launcherButtonRef, refresh, roles,
}) {
  const [newUser, setNewUser] = useState({
    username: '', password: '', confirm: '', realname: '', role: '',
  });

  const [error, setErr] = useState();

  const [createUser] = useMutation(CREATE_USER);

  return (
    <Modal
      launcherButtonRef={launcherButtonRef}
      modalHeading="Create a new User"
      modalLabel="Users"
      primaryButtonText="Create"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        setErr();
        const payload = {
          variables: {
            user: {
              username: newUser.username, realname: newUser.realname, role: newUser.role, password: newUser.password,
            },
          },
        };
        createUser(payload).then(() => {
          refresh();
          setOpen(false);
        }).catch((err) => {
          setErr(err);
        });
      }}
      onRequestClose={() => {
        setOpen(false);
        setTimeout(() => {
          setNewUser({
            username: '', password: '', realname: '', role: '',
          });
        }, 250);
      }}
    >
      <Stack gap={4}>
        <TextInput
          id="realname"
          type="text"
          placeholder="Grant Petty"
          labelText="Real Name"
          required
          value={newUser.realname}
          onChange={(e) => setNewUser({ ...newUser, realname: e.target.value })}
        />
        <TextInput
          id="username"
          type="text"
          placeholder="user@route.broker"
          labelText="Username"
          required
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <TextInput
          id="password"
          type="password"
          required
          placeholder="Enter a password"
          labelText="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <TextInput
          id="confirm-password"
          type="password"
          required
          placeholder="Confirm password"
          labelText="Confirm Password"
          value={newUser.confirm}
          invalid={(newUser.password && newUser.confirm && (newUser.password !== newUser.confirm)) === true}
          invalidText="Password does not match"
          onChange={(e) => setNewUser({ ...newUser, confirm: e.target.value })}
        />
        <Dropdown
          id="role"
          titleText="User Role"
          label="Select a Role"
          items={roles}
          direction="top"
          selectedItem={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.selectedItem })}
        />
        <GraphQLError error={error} />
      </Stack>
    </Modal>
  );
}

NewUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  launcherButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  refresh: PropTypes.func.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default NewUser;
