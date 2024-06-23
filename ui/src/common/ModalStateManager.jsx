import React, { useState } from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

function ModalStateManager({
  renderLauncher: LauncherContent,
  children: ModalContent,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!ModalContent || typeof document === 'undefined' ? null : ReactDOM.createPortal(<ModalContent open={open} setOpen={setOpen} />, document.body)}
      {LauncherContent && <LauncherContent open={open} setOpen={setOpen} />}
    </>
  );
}

ModalStateManager.propTypes = {
  renderLauncher: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default ModalStateManager;
