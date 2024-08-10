import React from 'react';
import PropTypes from 'prop-types';

import { SideNavLink as CarbonSideNavLink, SideNavDivider } from '@carbon/react';

import { useQuery } from '@apollo/client';

import { LIST_STREAMS } from '../queries';
import SideNavLink from '../../../common/SideNavLink.jsx';

function SideNavStreamsList({ onClickSideNavExpand }) {
  const {
    data,
  } = useQuery(LIST_STREAMS);
  return (
    <>
      <SideNavDivider />
      {!data && (
      <CarbonSideNavLink large disabled>
        <em>Loading Streams...</em>
      </CarbonSideNavLink>
      ) }
      {data && data.streams.map((stream) => (
        <SideNavLink key={stream.slug} to={`/streams/view/${stream.slug}`} label={stream.label} onClick={() => { onClickSideNavExpand(); }} />
      ))}
    </>
  );
}

SideNavStreamsList.propTypes = { onClickSideNavExpand: PropTypes.func.isRequired };

export default SideNavStreamsList;
