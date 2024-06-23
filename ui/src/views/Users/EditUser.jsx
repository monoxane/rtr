import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  TextInput,
  Dropdown, DropdownSkeleton,
  Stack,
} from '@carbon/react';

import { getAxiosPrivate } from '../../hooks/useAxiosPrivate';

function EditUserModal({
  open, setOpen, launcherButtonRef, refresh, user, roles,
}) {
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (!open) {
      setUserData(user);
    }
  }, [user, open]);

  const axios = getAxiosPrivate();

  return (
    <Modal
      launcherButtonRef={launcherButtonRef}
      modalHeading={`Edit ${user.username}`}
      modalLabel="Users"
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      open={open}
      onRequestSubmit={() => {
        axios.patch(`/v1/api/users/${user.id}`, userData)
          .then(() => {
            refresh();
            setOpen(false);
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
          value={userData.real_name}
          onChange={(e) => setUserData({ ...userData, real_name: e.target.value })}
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
        {roles.loading && <DropdownSkeleton />}
        {roles.error && 'Unable to load Roles'}
        {roles.data
        && (
          <Dropdown
            id="role"
            titleText="User Role"
            label="Select a Role"
            items={roles.data}
            direction="top"
            selectedItem={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.selectedItem })}
          />
        )}
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
