import PropTypes from 'prop-types';

const streamPropTypes = PropTypes.shape({
  id: PropTypes.number,
  label: PropTypes.string,
  slug: PropTypes.string,
  isRoutable: PropTypes.bool,
  isActive: PropTypes.bool,
  clients: PropTypes.number,
});

export default streamPropTypes;
