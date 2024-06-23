import PropTypes from 'prop-types';

const userPropType = PropTypes.shape({
  id: PropTypes.number,
  username: PropTypes.string,
  real_name: PropTypes.string,
  role: PropTypes.string,
});

export default userPropType;
