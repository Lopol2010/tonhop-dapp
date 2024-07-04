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

interface TransferInfoProps {
  isBridgeLoading: boolean,
  isBridgeSuccess: boolean,
  bridgeHash: `0x${string}` | undefined,
  amount: string,
  onClickBack: () => void
}
const TransferInfo: React.FC<TransferInfoProps> = ({isBridgeLoading, isBridgeSuccess, bridgeHash, amount, onClickBack}) => {
  const [confirmationCountdown, setConfirmationCountdown] = useState(0.0);


  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const stopCountdown = () => {
      clearInterval(intervalId);
      setConfirmationCountdown(0.0);
    };

    if (isBridgeLoading) {
      setConfirmationCountdown(4.0);
      intervalId = setInterval(() => {
        setConfirmationCountdown((currentValue) => {
          let newValue = currentValue - 0.05;
          if (newValue <= 0) {
            stopCountdown();
          }
          return newValue;
        });
      }, 50)
    }
    return stopCountdown;
  }, [isBridgeLoading])



    return <div>
      <div>
        <div className='flex mx-5'>
          <div className="text-left font-medium">BSC transaction:</div>

          <div className='mx-5'>{bridgeHash ? bridgeHash.replace(/^(\w{6})\w+(\w{6})$/g, "$1...$2") : "-"}</div>
          <div className='flex-1 text-right ml-2'>
            {
              isBridgeSuccess
                ? <span className='text-green-500'>Success!</span>
                : bridgeHash
                  ? <span className='text-black-500'>Confirming {confirmationCountdown.toString().replace(/\.(\d{2})\d*/g, ".$1")}</span>
                  : "-"
            }
          </div>
        </div>
        <div className='flex mb-5 mx-5'>
          <div className='font-medium'>WTON amount in:</div>
          <div className='mx-5'>{amount ? amount : "-"}</div>
        </div>
        <div className='flex mx-5'>
          <div className='text-left font-medium'>TON transaction:</div>
          <div className='mx-5'>{"-"}</div>
        </div>
        <div className='flex mx-5 mb-5'>
          <div className='font-medium'>TON amount out:</div>
          <div className='mx-5'>{"-"}</div>
        </div>
      </div>

      <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300"
        onClick={() => onClickBack()}>
        Back
      </button>
    </div>


}

export default TransferInfo;