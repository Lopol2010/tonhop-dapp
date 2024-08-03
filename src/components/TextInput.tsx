// src/components/TransferAssets.js

import { useEffect, useState } from 'react';
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

const TextInput = ({amount, onAmountInputChange, placeholder}: any) => {
  return (
    <input className="w-[calc(100%-40px)]
                          p-3 mx-5 mb-5
                          bg-gray-100
                          outline-blue-500
                          border border-solid border-gray-300 rounded-md
                          dark:bg-gray-700
                          dark:border-none
                          dark:outline-gray-100"
      placeholder={placeholder} type="text" value={amount} onChange={onAmountInputChange} />
  )
}



export default TextInput;