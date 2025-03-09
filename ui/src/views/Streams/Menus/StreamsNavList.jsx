import React from 'react';

import { SideNavLink as CarbonSideNavLink, SideNavDivider } from '@carbon/react';

import { useQuery } from '@apollo/client';

import { LIST_STREAMS } from '../queries.js';
import HeaderMenuItem from '../../../partials/Layout/HeaderMenuItem.jsx';

function StreamsNavList() {
  const {
    data,
  } = useQuery(LIST_STREAMS);

  if (!data) {
    return (
      <>
        <SideNavDivider />
        <CarbonSideNavLink large disabled>
          <em>Loading Streams...</em>
        </CarbonSideNavLink>
      </>
    );
  }

  return (
    <>
      {data.streams.length !== 0 && (
      <SideNavDivider />
      ) }
      {data && data.streams.map((stream) => (
        <HeaderMenuItem key={stream.slug} to={`/streams/view/${stream.slug}`} label={stream.label} />
      ))}
    </>
  );
}

export default StreamsNavList;
