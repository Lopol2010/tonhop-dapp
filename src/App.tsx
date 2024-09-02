import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './App.css';
import MainTransferPanel from './components/MainTransferPanel';
import { Navbar } from './components/Navbar';
import { ChainName } from './types/ChainName';
import { useCallback, useEffect, useState } from 'react';
import { Address, Transaction } from '@ton/ton';
import useFindTonTransaction from './hooks/useFindTonTransaction';
import { networkConfig } from './networkConfig';
import { isAddress } from 'viem';

const STORAGE_VERSION = '2.0'; // Update this when you change your storage schema

let manifestUrl;
function App() {

  // function extractPayload(tx: Transaction) {
  //   if (!tx.inMessage) return null;

  //   let payloadString;
  //   let extractedDestinationAddress;
  //   let extractedMemo;
  //   try {
  //     payloadString = tx.inMessage.body.beginParse().loadStringTail();
  //     if (tx.inMessage.body.beginParse().remainingRefs == 1) {
  //       payloadString += tx.inMessage.body.beginParse().loadStringRefTail();
  //     }
  //     // remove 4 bytes of zeroes
  //     payloadString = payloadString.trim().slice(4);
  //     extractedDestinationAddress = payloadString.slice(0, 42);
  //     extractedMemo = payloadString.slice(43);
  //   } catch (error) {
  //     console.log("error parsing payload:", error);
  //     return null;
  //   }
  //   return { extractedDestinationAddress, extractedMemo }
  // }

  // // console.log("transferStartTimestamp", transferStartTimestamp, memo)
  // const transactionSenderAddress = "UQC_pxTeZV0YIxOhOWRyJpuni-ab-68Akldrl6pvhZ3BcgV8";
  // const destinationAddress = "EQDbm_PjuTsS2eUwaqcESuOqkiTBNIZrB5R12g54lBsQ7S5m";
  // const memo = "6480040422"
  // const incomingTransaction = useFindTonTransaction(
  //   networkConfig.ton.highloadWalletAddress.toString(),
  //   0,
  //   useCallback((tx: Transaction) => {
  //     // console.log(tx)
  //     if (!transactionSenderAddress || !destinationAddress || !tx.inMessage?.info.src || !tx.inMessage.info.dest
  //       || !(tx.inMessage.info.src as Address).equals(Address.parse(transactionSenderAddress))
  //       || !(tx.inMessage.info.dest as Address).equals(networkConfig.ton.highloadWalletAddress)) {
  //       return false;
  //     }

  //     const payload = extractPayload(tx);
  //     console.log(payload)
  //     if (!payload || !isAddress(payload.extractedDestinationAddress) || payload.extractedMemo != memo) return false;

  //     return true;

  //   }, [destinationAddress, transactionSenderAddress]));
  
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
