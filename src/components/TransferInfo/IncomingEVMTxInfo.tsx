import { useEffect, useState } from 'react';
import { networkConfig } from '../../networkConfig';
import { QueryStatus } from '@tanstack/react-query';
import { formatTxHexHash, formatWTON, stripDecimals } from '../../utils/utils';

interface IncomingEVMTxInfoProps {
  transactionStatus: QueryStatus,
  transactionHash: `0x${string}` | undefined,
  destinationAddress: string,
  amount: string | undefined,
  countdownTime?: number,
}
const IncomingEVMTxInfo: React.FC<IncomingEVMTxInfoProps> = ({ destinationAddress, transactionStatus, transactionHash, amount, countdownTime = 7.0 }) => {
  const [confirmationCountdown, setConfirmationCountdown] = useState(0.0);

  const txStatusConfig = {
    "success": { text: "Success!", className: "text-green-500" },
    "pending": { text: "Confirming...", className: "dark:text-gray-300" },
    "error": { text: "Failed.", className: "text-red-500" },
  };

  const { text: txStatusText, className: txStatusClassName } = txStatusConfig[transactionStatus];

  // TODO: refactor for reverse direction - countdownTime when waiting for confirmation or searching
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const stopCountdown = () => {
      clearInterval(intervalId);
      setConfirmationCountdown(0.0);
    };

    if (transactionStatus == "pending") {
      setConfirmationCountdown(countdownTime);
      // TODO: should rely on timestamp, otherwise timer when tab is inactive
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
  }, [transactionStatus, countdownTime])




  return (<div>
    <div>
      <div className='mb-5 mx-5'>
        <div className="text-left font-medium text-lg">BNB chain</div>

        <div>
          <div className='flex mx-5 text-base'>
            <div className='mr-5 text-left'>
              <div className=''>Bridge received:</div>
              <div className=''>Transaction:</div>
              <div className='text-left '>Status: </div>
            </div>
            <div className='flex-1 text-left' >
              <div className=' font-medium '>{amount ? stripDecimals(formatWTON(BigInt(amount))) + " WTON" : "-"}</div>
              <div className=' font-medium '>
                <a className='flex dark:text-blue-400' href={transactionHash ? networkConfig.bnb.getExplorerLink(transactionHash) : ""} target='_blank'>
                  <span className=''>
                    {transactionHash ? formatTxHexHash(transactionHash) : "-"}
                  </span>
                </a>
              </div>
              <div className={`font-medium ${txStatusClassName}`}>
                {txStatusText + " "}
                <span className='w-[4ch]'>
                  {
                    (transactionHash && transactionStatus === "pending" && confirmationCountdown > 0
                      ? confirmationCountdown.toString().replace(/\.(\d{2})\d*/g, ".$1")
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

export default IncomingEVMTxInfo;