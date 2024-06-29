import {
  useNavigate,
} from 'react-router-dom';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

// import useAuth from '../../hooks/useAuth';
// import userPropType from './propTypes';
// import EditUserModal from './EditUser.jsx';
import DeleteStreamModal from '../Modals/DeleteStreamModal.jsx';
// import ChangePasswordModal from './ChangePassword.jsx';

const StreamsDataTableActionMenu = function StreamsDataTableActionMenu({ refresh, stream }) {
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, setEditOpen] = useState(false);

  return (
    <>
      <DeleteStreamModal refresh={refresh} stream={stream} setOpen={setDeleteOpen} open={deleteOpen} />
      {/* <EditUserModal refresh={refresh} user={user} setOpen={setEditOpen} open={editOpen} roles={roles} />
      <ChangePasswordModal user={user} setOpen={setPasswordOpen} open={passwordOpen} /> */}

      <OverflowMenu flipped={document?.dir === 'rtl'} iconDescription="Actions" aria-label="overflow-menu">
        <OverflowMenuItem onClick={() => setEditOpen(true)} itemText="Edit Stream" />
        <OverflowMenuItem onClick={() => navigate(`/streams/${stream.slug}`)} itemText="Open" />
        <OverflowMenuItem onClick={() => { setDeleteOpen(true); }} itemText="Delete Stream" hasDivider isDelete />
      </OverflowMenu>
    </>
  );
};

StreamsDataTableActionMenu.propTypes = {
  refresh: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  stream: PropTypes.object.isRequired,
};

export default StreamsDataTableActionMenu;
