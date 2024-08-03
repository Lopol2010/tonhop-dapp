// src/components/TransferAssets.js

import React, { useEffect, useState } from 'react';
import '../App.css';
import { useAccount, useBalance, useConfig, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { bridgeAbi } from '../generated';
import { erc20Abi } from 'viem';
import { networkConfig } from '../networkConfig';
import { formatWTON, hasTestnetFlag, isValidTonAddress, parseWTON, stripDecimals } from '../utils';
import { ConnectKitButton } from 'connectkit';
import { readContract } from 'wagmi/actions';
import TransferInfo from './TransferInfo';
import { HistoryEntry, saveHistoryEntry } from './HistoryStorage';
import NetworkSelector from './NetworkSelector';
import TextInput from './TextInput';

interface TransferAssetsInputsProps {
  userBalance: bigint
  mainButton: React.ReactNode
  amountInput: React.ReactNode
  destinationAddressInput: React.ReactNode
  formattedEstimatedReceiveAmount: React.ReactNode | string
  onClickUserBalance: () => void
}

const TransferAssetsInputs: React.FC<TransferAssetsInputsProps>  = ({
  userBalance, 
  mainButton, 
  amountInput, 
  destinationAddressInput, 
  formattedEstimatedReceiveAmount, 
  onClickUserBalance
}) => {

  return (
      <div>
        <div className="form-group mt-8">
          <div className='flex mx-5 mb-2'>
            <div className='flex-1 text-left font-medium'>Amount</div>
            <div className='flex-1 text-right font-medium'>
              <span className='text-gray-400'>balance: </span>
              {
                // TODO: refactor to support reverse direction
                userBalance
                  ? <span className='cursor-pointer dark:text-gray-300' onClick={() => onClickUserBalance() }>
                    {stripDecimals(formatWTON(userBalance))}
                  </span>
                  : "-"
              }
            </div>
          </div>
          {amountInput}
          <div className='flex mx-5 mb-2'>
            <div className='flex-1 text-left font-medium'>Recipient</div>
          </div>
            {destinationAddressInput}
        </div>
        {
          formattedEstimatedReceiveAmount
        }
        {mainButton}
        <div className='font-medium text-sm text-gray-400'>
          {/* <div>Bridge fee: {networkConfig.bridgeFee} TON </div> */}
          <div>Network fee: 0.0002 BNB + 0.008 TON</div>
        </div>
      </div>
  )
}



export default TransferAssetsInputs;