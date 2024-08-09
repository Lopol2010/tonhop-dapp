import { useState } from 'react';
import { formatUnits } from 'viem';
import '../App.css';
import { networkConfig } from '../networkConfig';
import { stripDecimals } from '../utils/utils';
import { getAllHistoryEntries, HistoryEntry } from './HistoryStorage';

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
    return hash.replace(/^(\w{5})\w+(\w{4})$/g, "$1...$2");
  }

  return <div className='mt-5'>
    {
      historyEntries.length > 0
        ? <div className='flex p-3 mx-5 border-b-2 border-solid border-gray-200 dark:border-gray-400'>

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
        : <div className='flex justify-center py-20 px-6 md:px-10 mx-5 text-lg text-gray-400 font-semibold'>
            Your transfers history is empty.
        </div>
    }
    {
      historyEntries.reverse().map((entry, i) => {
        // TODO: format amount!
        return <div key={i} className={`flex p-3 mx-5 border-b-2 border-gray-200 dark:border-gray-500 ${i == historyEntries.length - 1 ? "border-none" : "border-solid"}`}>
          <div className='flex-1'>
            {/* {(new Date(entry.date)).toLocaleDateString()} */}
            {(entry.bridgeRecievedAmount) ? entry.bridgeRecievedAmount + " WTON" : "-"}
          </div>
          <div className='flex-1'>
            <a href={networkConfig.bnb.getExplorerLink(entry.bnb.txHash)} target='_blank'>
              {formatTxHexHash(entry.bnb.txHash)}
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