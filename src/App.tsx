import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './App.css';
import MainTransferPanel from './components/MainTransferPanel';
import { Navbar } from './components/Navbar';
import { ChainName } from './types/ChainName';
import { useState } from 'react';


let manifestUrl;
function App() {
  if(import.meta.env.MODE == "development") {
    manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';
  } else {
    manifestUrl = "https://knowledgeable-sail.surge.sh/tonconnect-manifest.json";
  }

  const [fromNetwork, setFromNetwork] = useState(ChainName.BNB);
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div className="App dark:bg-gray-700 h-full text-black dark:text-gray-300">
        <Navbar fromNetwork={fromNetwork}></Navbar>
        <MainTransferPanel fromNetwork={fromNetwork} setFromNetwork={setFromNetwork}></MainTransferPanel>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
