import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import HistoryTab from './HistoryTab';
import TransferAssetsTab from './TransferAssetsTab';
import { ChainName } from '../types/ChainName';

interface MainTransferPanelProps {
  fromNetwork: ChainName,
  setFromNetwork: (network: ChainName) => void;
}

const MainTransferPanel: React.FC<MainTransferPanelProps> = ({ fromNetwork, setFromNetwork }) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Tabs onSelect={(index) => setTabIndex(index)}>
      <div className="my-5 mx-auto sm:bg-white sm:shadow-[0_0_10px_rgb(0,0,0,0.1)] sm:radius-5 dark:bg-gray-800 min-h-96 py-5 px-0 sm:px-5 w-full sm:w-11/12 md:w-3/4 lg:w-3/5 xl:w-2/5 min-w-fit">
        <div className=''>
          <TabList className="flex mx-5 mb-5 group">
            <Tab className={`border-none border-b-[3px] border-blue-500 cursor-pointer text-left text-lg font-bold text-gray-400 dark:text-gray-400`}
              selectedClassName="group selected !border-solid outline-none">
              <h3 className='group-[.selected]:text-black group-[.selected]:dark:text-gray-200'>Transfer Assets</h3>
            </Tab>
            <Tab className="border-none border-b-[3px] border-blue-500 cursor-pointer text-left text-lg font-bold text-gray-400 dark:text-gray-400 ml-8"
              selectedClassName="group selected !border-solid outline-none">
              <h3 className='group-[.selected]:text-black group-[.selected]:dark:text-gray-200 text-left text-lg font-bold'>History</h3>
            </Tab>
          </TabList>
        </div>
        <TabPanel forceRender={true} className={`${tabIndex == 0 ? "block" : "hidden"}`}>
          <TransferAssetsTab fromNetwork={fromNetwork} setFromNetwork={setFromNetwork}></TransferAssetsTab>
        </TabPanel>
        <TabPanel>
          <HistoryTab></HistoryTab>
        </TabPanel>
      </div>
    </Tabs>
  );
}

export default MainTransferPanel;