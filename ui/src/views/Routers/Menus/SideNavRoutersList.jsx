import React from 'react';
import PropTypes from 'prop-types';

import { SideNavLink as CarbonSideNavLink, SideNavDivider } from '@carbon/react';

import { useQuery } from '@apollo/client';

import { LIST_ROUTERS } from '../queries.js';
import SideNavLink from '../../../common/SideNavLink.jsx';

function SideNavRoutersList({ onClickSideNavExpand }) {
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
        <SideNavLink key={router.slug} to={`/routers/${router.id}/control`} label={router.label} onClick={() => { onClickSideNavExpand(); }} />
      ))}
    </>
  );
}

SideNavRoutersList.propTypes = { onClickSideNavExpand: PropTypes.func.isRequired };

export default SideNavRoutersList;
