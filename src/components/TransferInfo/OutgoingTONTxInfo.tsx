import { useEffect, useState } from 'react';
import { networkConfig } from '../../networkConfig';
import { formatTxHexHash } from '../../utils/utils';

interface OutgoingTONTxInfoProps {
  destinationAddress: string | undefined,
  transactionLT: bigint | undefined,
  transactionHash: string | undefined,
  amount: string | undefined,
  isActive: boolean,
  countdownTime?: number
}

const OutgoingTONTxInfo: React.FC<OutgoingTONTxInfoProps> = ({ destinationAddress, transactionHash, amount, isActive, countdownTime = 30.0 }) => {
  const [confirmationCountdown, setConfirmationCountdown] = useState(0.0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const stopCountdown = () => {
      clearInterval(intervalId);
      setConfirmationCountdown(0.0);
    };

    if (isActive) {
      setConfirmationCountdown(countdownTime);
      // TODO: should rely on timestamp, because setInterval pauses when for example you switch windows
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
  }, [isActive, countdownTime])



  return (
    // isBridgeSuccess
    <div className={`mx-5 text-left ${isActive ? "" : "text-gray-400"}`}>
      <div className='text-left font-medium text-lg'>TON chain:</div>
      <div className='flex mb-5 mx-5'>
        <div className='mr-5'>
          <div className=''>Destination received:</div>
          <div className=''>Transaction:</div>
        </div>
        <div className='flex-1'>
          <div className='font-medium'>{
            transactionHash
              ? amount + " TON"
              : "-"
          }
          </div>
          <a className={`flex ${transactionHash ? "dark:text-blue-400" : "cursor-default text-inherit hover:text-inherit"}`}
            href={transactionHash ? networkConfig.ton.getExplorerLink(transactionHash) : ""}
            onClick={e => transactionHash || e.preventDefault()} target='_blank'>
            <span className='whitespace-pre'>
              {
                transactionHash
                  ? formatTxHexHash(transactionHash)
                  : isActive
                    ? confirmationCountdown > 0
                      ? "Searching... "
                      : ""
                    : "-"
              }
            </span>

            {
              isActive
                ? transactionHash
                  ? ""
                  : confirmationCountdown > 0
                    ? <span className='w-[4ch]'>{confirmationCountdown.toString().replace(/\.(\d{2})\d*/g, ".$1")}</span>
                    : <span className=''>Almost there!</span>
                : ""
            }

          </a>
          <div className={`font-medium text-black-500`}>
          </div>
        </div>
      </div>
    </div>
    // : ""
  );



}

export default OutgoingTONTxInfo;