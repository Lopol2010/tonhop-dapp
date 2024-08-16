import { useState } from 'react';
import { formatUnits } from 'viem';
import '../App.css';
import { networkConfig } from '../networkConfig';
import { formatTxHexHash as _formatTxHexHash, formatWTON, stripDecimals } from '../utils/utils';
import { CrosschainTransfer, getAllHistoryEntries } from './HistoryStorage';

interface TransferInfoProps {
}

const HistoryTab: React.FC<TransferInfoProps> = () => {
  const [isShowInfo, setIsShowInfo] = useState(false);
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
    return _formatTxHexHash(hash, 5, 4);
  }

  // TODO: Change header
  return <div className='mt-5'>
    
    {
      historyEntries.length > 0
        ? <div className='flex p-3 mx-5 border-b-2 border-solid border-gray-200 dark:border-gray-400'>

          <div className='flex-1'>
            Amount
          </div>
          
          <div className='flex-1'>
            From
          </div>
          <div className='flex-1'>
            To
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
            {(entry.amountReceived) 
            ? entry.sourceTransaction.type == "TON"
              ? formatToncoin(BigInt(entry.amountReceived)) + " WTON"
              : formatToncoin(BigInt(entry.amountReceived)) + " TON" 
            : "-"}
          </div>
          <div className='flex-1'>
            {
              entry.sourceTransaction.type == "TON"
                ? <a href={networkConfig.ton.getExplorerLink(entry.sourceTransaction.hash)} target='_blank'>
                  {formatTxHexHash(entry.sourceTransaction.hash)}
                </a>
                : <a href={networkConfig.bnb.getExplorerLink(entry.sourceTransaction.txHash)} target='_blank'>
                  {formatTxHexHash(entry.sourceTransaction.txHash)}
                </a>
            }
          </div>
          <div className='flex-1'>
            {
              entry.destinationTransaction
                ? entry.destinationTransaction.type == "TON"
                  ? <a href={networkConfig.ton.getExplorerLink(entry.destinationTransaction.hash)} target='_blank'>
                    {formatTxHexHash( entry.destinationTransaction.hash)}
                  </a>
                  : <a href={networkConfig.bnb.getExplorerLink(entry.destinationTransaction.txHash)} target='_blank'>
                    {formatTxHexHash( entry.destinationTransaction.txHash)}
                  </a>
                : "-"
            }
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