import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

import { useMutation, gql } from '@apollo/client';

import useAuth from '../../hooks/useAuth';
import userPropType from './propTypes';
import EditUserModal from './EditUser.jsx';
import DeactivateUserModal from './DeactivateUser.jsx';
import ChangePasswordModal from './ChangePassword.jsx';

const REACTIVATE_USER = gql`mutation reactivateUser($id:Int!) {
  reactivateUser(id:$id)
}`;

const UserMenu = function UserMenu({ refresh, user, roles }) {
  const { auth } = useAuth();

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [reactivateUser] = useMutation(REACTIVATE_USER);

  return (
    <>
      <DeactivateUserModal refresh={refresh} user={user} setOpen={setDeactivateOpen} open={deactivateOpen} />
      <EditUserModal refresh={refresh} user={user} setOpen={setEditOpen} open={editOpen} roles={roles} />
      <ChangePasswordModal user={user} setOpen={setPasswordOpen} open={passwordOpen} />

      <OverflowMenu flipped={document?.dir === 'rtl'} iconDescription="Actions" aria-label="overflow-menu">
        {!user.deletedAt && (
        <>
          <OverflowMenuItem onClick={() => setEditOpen(true)} itemText="Edit user" disabled={user.deleted_at} />
          <OverflowMenuItem onClick={() => setPasswordOpen(true)} itemText="Change Password" disabled={user.deleted_at} />
          <OverflowMenuItem onClick={() => { setDeactivateOpen(true); }} itemText="Deactivate user" hasDivider isDelete disabled={user.username === auth.user} />
        </>
        )}
        {user.deletedAt && <OverflowMenuItem onClick={() => { reactivateUser({ variables: { id: user.id } }).then(() => refresh()); }} itemText="Reactivate user" hasDivider />}
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
