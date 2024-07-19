// src/components/TransferAssets.js

import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useAccount, useAccountEffect, useBalance, useConfig, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { bridgeAbi } from '../generated';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { networkConfig } from '../networkConfig';
import warningSign from "../assets/warning.webp"
import { formatWTON, hasTestnetFlag, isValidTonAddress, parseWTON, stripDecimals } from '../utils';
import { ConnectKitButton } from 'connectkit';
import { getBalance, readContract } from 'wagmi/actions';
import { MutationStatus, QueryStatus } from '@tanstack/react-query';
import { getAllHistoryEntries, HistoryEntry } from './HistoryStorage';
import TransferInfo from './TransferInfo';

interface TransferInfoProps {
}

const HistoryTab: React.FC<TransferInfoProps> = () => {
  const [isShowInfo, setIsShowInfo] = useState(false);
  const [historyEntryToShow, setHistoryEntryToShow] = useState<HistoryEntry>();
  const [historyEntries, setHistoryEntries] = useState(() => {
    return getAllHistoryEntries();
    // return [{

    //   date: 0,
    //   bridgeRecievedAmount: "1337",
    //   destinationReceivedAmount: undefined,
    //   destinationAddress: "0xabc",
    //   bsc: {
    //     txHash: "0xabcd",
    //     status: "success",
    //   },
    //   ton: undefined
    // }, {
    //   date: 0,
    //   bridgeRecievedAmount: "999",
    //   destinationReceivedAmount: 900n,
    //   destinationAddress: "0xabc",
    //   bsc: {
    //     txHash: "0xabcd",
    //     status: "success",
    //   },
    //   ton: {
    //     txHash: "0xasdfasfasdf",
    //     txLt: 19999234234n
    //   }

    // }
    // ] as HistoryEntry[];
  });

  function formatToncoin(amount: bigint) {
    return stripDecimals(formatUnits(amount, networkConfig.ton.tonDecimals));
  }

  function formatTxHexHash(hash: string) {
    return hash.replace(/^(\w{6})\w+(\w{5})$/g, "$1...$2");
  }

  return <div className='mt-5'>
      <div className='flex p-3 mx-5 border-b-2 border-solid border-gray-200 dark:border-gray-400'>

        <div className='flex-1'>
          Amount
        </div>
        <div className='flex-1'>
          BSC
        </div>
        <div className='flex-1'>
          TON
        </div>
      </div>
    {
      // historyEntryToShow
      // ? <TransferInfo isBridgeLoading={false}
      //   isBridgeSuccess={true}
      //   destinationAddress={historyEntryToShow.destinationAddress}
      //   bridgeTxStatus={"success"}
      //   bridgeHash={historyEntryToShow.bsc.txHash}
      //   amount={historyEntryToShow.bridgeRecievedAmount}
      //   onClickBack={() => setHistoryEntryToShow(undefined)}>
      // </TransferInfo>
      // : 
        historyEntries.reverse().map((entry, i) => {
          // TODO: format amount!
          return <div key={i} className='flex p-3 mx-5 border-b-2 border-solid border-gray-200 dark:border-gray-500'>
      <div className='flex-1'>
        {/* {(new Date(entry.date)).toLocaleDateString()} */}
        {(entry.bridgeRecievedAmount) ? entry.bridgeRecievedAmount + " WTON" : "-"}
      </div>
      <div className='flex-1'>
        <a href={networkConfig.bsc.getExplorerLink(entry.bsc.txHash)} target='_blank'>
          {formatTxHexHash(entry.bsc.txHash)}
        </a>
      </div>
      <div className='flex-1'>
        <a href={entry.ton ? networkConfig.ton.getExplorerLink(entry.ton.txHash) : ""} target='_blank'>
          {entry.ton ? formatTxHexHash("0x" + entry.ton.txHash) : "-"}
        </a>
      </div>
      {/* <div className='flex-1'>
              <a href='' onClick={(e) => {e.preventDefault(); setHistoryEntryToShow(entry)}}>
                View details
              </a>
            </div> */}
    </div>
        })

    }
  </div>
}
export default HistoryTab;