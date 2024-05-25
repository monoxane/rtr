import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Modal,
  FileUploader,
} from '@carbon/react';

function DashboardLabelsUpload({
  open, setOpen,
}) {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const submit = () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('rtr-dashboard-labels.lbl', file, 'rtr-dashboard-labels.lbl');

    axios.post('/v1/config/labels/dashboard', formData, {
      headers: {
        // 'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        setOpen(false);
        setIsLoading(false);
        setFile(null);
      });
  };

  return (
    <Modal
      modalHeading="Import Ross Dashboard .lbl File"
      primaryButtonText="Upload"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={isLoading}
      open={open}
      onRequestClose={() => setOpen(false)}
      onRequestSubmit={submit}
    >
      <FileUploader
        labelTitle="Upload file"
        labelDescription="Max file size is 10kb. Only .lbl files are supported."
        buttonLabel="Select file"
        buttonKind="primary"
        size="md"
        filenameStatus={isLoading ? 'uploading' : 'edit'}
        accept={['.lbl']}
        disabled={isLoading}
        iconDescription="Delete file"
        name=""
        onChange={(e) => { setFile(e.target.files[0]); }}
      />
    </Modal>
  );
}

DashboardLabelsUpload.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default DashboardLabelsUpload;
