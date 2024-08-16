import { useEffect, useState } from 'react';
import { networkConfig } from '../../networkConfig';
import { QueryStatus } from '@tanstack/react-query';
import { useWaitForTransactionReceipt } from 'wagmi';
import { formatTxHexHash } from '../../utils/utils';

interface OutgoingEVMTxInfoProps {
  // transactionStatus: QueryStatus,
  transactionHash: `0x${string}` | undefined,
  destinationAddress: `0x${string}` | undefined,
  amount: string | undefined,
  countdown?: number,
  isActive: boolean
}
const OutgoingEVMTxInfo: React.FC<OutgoingEVMTxInfoProps> = ({ isActive, destinationAddress, transactionHash, amount, countdown = 7.0 }) => {
  const [confirmationCountdown, setConfirmationCountdown] = useState(0.0);

  // const { isLoading, isSuccess, status: receiptStatus} = useWaitForTransactionReceipt({
  //   hash: transactionHash,
  // })

  // const [transactionStatus, setTransactionStatus] = useState<QueryStatus>("pending");

  const txStatusConfig = {
    "success": { text: "Success!", className: "text-green-500" },
    "pending": { text: "Confirming...", className: "dark:text-gray-300" },
    "error": { text: "Failed.", className: "text-red-500" },
  };

  const transactionStatus = transactionHash ? "success" : "pending";
  const { text: txStatusText, className: txStatusClassName } = txStatusConfig[transactionStatus];

  // useEffect(() => {
  //   if(receiptStatus == "success") {
  //     setTransactionStatus(receiptStatus);
  //   }
  // }, [receiptStatus])

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const stopCountdown = () => {
      clearInterval(intervalId);
      setConfirmationCountdown(0.0);
    };

    if (isActive) {
      setConfirmationCountdown(countdown);
      intervalId = setInterval(() => {
        setConfirmationCountdown((currentValue) => {
          let newValue = currentValue - 0.05;
          if (newValue <= 0.1) {
            stopCountdown();
            newValue = 0.0;
          }
          return newValue;
        });
      }, 50)
    }
    return stopCountdown;
  }, [isActive, countdown])



  return (<div className={`${isActive ? "" : "text-gray-400"}`}>
    <div>
      <div className='mb-5 mx-5'>
        <div className="text-left font-medium text-lg">BNB chain</div>

        <div>
          <div className='flex mx-5 text-base'>
            <div className='mr-5 text-left'>
              <div className=''>Destination received:</div>
              <div className=''>Transaction:</div>
              <div className='text-left '>Status: </div>
            </div>
            <div className='flex-1 text-left' >
              <div className=' font-medium '>{amount && transactionStatus == "success" ? amount + " WTON" : "-"}</div>
              <div className=' font-medium '>
                <a className='flex dark:text-blue-400' href={transactionHash ? networkConfig.bnb.getExplorerLink(transactionHash) : ""} target='_blank'>
                  <span className=''>
                    {transactionHash ? formatTxHexHash(transactionHash) : "-"}
                  </span>
                </a>
              </div>
              <div className={`font-medium ${txStatusClassName}`}>
                { isActive ? txStatusText : "-" }
                <span className='w-[4ch]'>
                  {
                    (confirmationCountdown > 0 && transactionStatus != "success"
                      ? " " + confirmationCountdown.toString().replace(/\.(\d{2})\d*/g, ".$1")
                      : "")
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>)


}

export default OutgoingEVMTxInfo;