import {
  useNavigate,
} from 'react-router-dom';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';

// import EditStreamModal from '../Modals/EditStream.jsx';
import DeleteRouterModal from '../Modals/DeleteRouterModal.jsx';

const RoutersDataTableActionMenu = function RoutersDataTableActionMenu({ refresh, router }) {
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);
  // const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DeleteRouterModal refresh={refresh} router={router} setOpen={setDeleteOpen} open={deleteOpen} />
      {/* <EditStreamModal refresh={refresh} stream={router} setOpen={setEditOpen} open={editOpen} /> */}

      <OverflowMenu flipped={document?.dir === 'rtl'} iconDescription="Actions" aria-label="overflow-menu">
        {/* <OverflowMenuItem onClick={() => setEditOpen(true)} itemText="Edit Stream" /> */}
        <OverflowMenuItem onClick={() => navigate(`/routers/xpt/${router.slug}`)} itemText="Open" />
        <OverflowMenuItem onClick={() => { setDeleteOpen(true); }} itemText="Delete Router" hasDivider isDelete />
      </OverflowMenu>
    </>
  );
};

RoutersDataTableActionMenu.propTypes = {
  refresh: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
};

export default RoutersDataTableActionMenu;
