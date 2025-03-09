import React from 'react';

import { SideNavLink as CarbonSideNavLink, SideNavDivider } from '@carbon/react';

import { useQuery } from '@apollo/client';

import { LIST_ROUTERS } from '../queries';
import HeaderMenuItem from '../../../partials/Layout/HeaderMenuItem.jsx';

function RoutersNavList() {
  const {
    data,
  } = useQuery(LIST_ROUTERS);

  if (!data) {
    return (
      <>
        <SideNavDivider />
        <CarbonSideNavLink large disabled>
          <em>Loading Routers...</em>
        </CarbonSideNavLink>
      </>
    );
  }

  return (
    <>
      {data.routers.length !== 0 && (
      <SideNavDivider />
      ) }
      {data && data.routers.map((router) => (
        <HeaderMenuItem key={router.slug} to={`/routers/${router.id}/control`} label={router.label} />
      ))}
    </>
  );
}

export default RoutersNavList;
