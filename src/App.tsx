import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './App.css';
import MainTransferPanel from './components/MainTransferPanel';
import { Navbar } from './components/Navbar';
import { ChainName } from './types/ChainName';
import { useEffect, useState } from 'react';

const STORAGE_VERSION = '2.0'; // Update this when you change your storage schema

let manifestUrl;
function App() {
  useEffect(() => {
    const currentVersion = localStorage.getItem('storageVersion');

    if (currentVersion !== STORAGE_VERSION) {
      localStorage.clear();
      localStorage.setItem('storageVersion', STORAGE_VERSION);
      console.log('Storage cleared and updated to version', STORAGE_VERSION);
    }
  }, []);

  if(import.meta.env.MODE == "development") {
    manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';
  } else {
    manifestUrl = "https://knowledgeable-sail.surge.sh/tonconnect-manifest.json";
  }

  const [fromNetwork, setFromNetwork] = useState(ChainName.BNB);
  const [toNetwork, setToNetwork] = useState(ChainName.TON);
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div className="App dark:bg-gray-700 h-full text-black dark:text-gray-300">
        <Navbar fromNetwork={fromNetwork}></Navbar>
        <MainTransferPanel networkSelectorState={{
          fromNetwork, toNetwork,
          setFromNetwork, setToNetwork
        }}></MainTransferPanel>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
