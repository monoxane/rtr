import React from 'react';

import {
  Tabs, TabList, Tab, TabPanels, TabPanel, Layer,
} from '@carbon/react';

const RouterConfig = function RouterConfig() {
  return (
    <Tabs>
      <TabList aria-label="List of tabs" contained>
        <Tab>Connection</Tab>
        <Tab>Inputs</Tab>
        <Tab>Outputs</Tab>
        <Tab>Tally</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Tab Panel 1</TabPanel>
        <TabPanel>
          <Layer>
            Tab Panel 2
          </Layer>
        </TabPanel>
        <TabPanel>Tab Panel 3</TabPanel>
        <TabPanel>Tab Panel 4</TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default RouterConfig;
