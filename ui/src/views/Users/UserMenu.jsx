import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

import EditUserModal from './EditUser.jsx';
import ChangePasswordModal from './ChangePassword.jsx';
import DeleteUserModal from './DeleteUser.jsx';

import useAuth from '../../hooks/useAuth';
import { getAxiosPrivate } from '../../hooks/useAxiosPrivate';

import userPropType from './propTypes';

const UserMenu = function UserMenu({ refresh, user, roles }) {
  const { auth } = useAuth();
  const axios = getAxiosPrivate();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const reactivateUser = () => {
    axios.post(`/v1/api/users/${user.id}/reactivate`)
      .then(() => {
        refresh();
      });
  };

  return (
    <>
      <DeleteUserModal refresh={refresh} user={user} setOpen={setDeleteOpen} open={deleteOpen} />
      <EditUserModal refresh={refresh} user={user} setOpen={setEditOpen} open={editOpen} roles={roles} />
      <ChangePasswordModal user={user} setOpen={setPasswordOpen} open={passwordOpen} />

      <OverflowMenu flipped={document?.dir === 'rtl'} iconDescription="Actions" aria-label="overflow-menu">
        {!user.deleted_at && (
        <>
          <OverflowMenuItem onClick={() => setEditOpen(true)} itemText="Edit user" disabled={user.deleted_at} />
          <OverflowMenuItem onClick={() => setPasswordOpen(true)} itemText="Change Password" disabled={user.deleted_at} />
          <OverflowMenuItem onClick={() => { setDeleteOpen(true); }} itemText="Deactivate user" hasDivider isDelete disabled={user.username === auth.user} />
        </>
        )}
        {user.deleted_at && <OverflowMenuItem onClick={() => { reactivateUser(); }} itemText="Reactivate user" hasDivider />}
      </OverflowMenu>
    </>
  );
};

UserMenu.propTypes = {
  refresh: PropTypes.func.isRequired,
  user: PropTypes.shape(userPropType).isRequired,
  roles: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.string).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    error: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};

export default UserMenu;
