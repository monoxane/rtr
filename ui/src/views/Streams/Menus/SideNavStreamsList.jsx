import React from 'react';
import PropTypes from 'prop-types';

import { SideNavLink as CarbonSideNavLink, SideNavDivider } from '@carbon/react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate.js';

import SideNavLink from '../../../common/SideNavLink.jsx';

function SideNavStreamsList({ onClickSideNavExpand }) {
  const [{ data }] = useAxiosPrivate()(
    '/v1/api/streams',
  );

  return (
    <>
      <SideNavDivider />
      {!data && (
      <CarbonSideNavLink large disabled>
        <em>Loading Streams...</em>
      </CarbonSideNavLink>
      ) }
      {data && data.map((stream) => (
        <SideNavLink key={stream.slug} to={`/streams/${stream.slug}`} label={stream.label} onClick={onClickSideNavExpand} />
      ))}
    </>
  );
}

SideNavStreamsList.propTypes = { onClickSideNavExpand: PropTypes.func.isRequired };

export default SideNavStreamsList;
