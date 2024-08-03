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
import TransferAssetsInputsEVM from './TransferAssetsInputsEVM';

const TransferAssetsTab = () => {
  const [warning, setWarning] = useState("");
  const [isValidAmountString, setIsValidAmountString] = useState(false);
  const [amount, setAmount] = useState("");
  const [bridgeChain, setBridgeChain] = useState(networkConfig.bsc.chain);
  const [allowance, setAllowance] = useState(0n);
  const [isShowInfo, setIsShowInfo] = useState(false);
  const { chains, switchChain } = useSwitchChain()
  const [destinationAddress, setDestinationAddress] = useState("");
  const { address, chainId, chain, isConnected } = useAccount();
  const config = useConfig();
  const [tabIndex, setTabIndex] = useState(0);
  const [isBridgeTransactionSent, setIsBridgeTransactionSent] = useState(false);

  const { data: wtonBalance, refetch: refetchBalance } = useBalance({
    token: import.meta.env.VITE_WTON_ADDRESS,
    address: address
  });

  const { writeContract: writeApproval, data: approveHash, status: approvalRequestStatus } = useWriteContract()
  const { writeContract: writeBridge, data: bridgeHash, status: bridgeRequestStatus } = useWriteContract()

  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { isLoading: isBridgeLoading, isSuccess: isBridgeSuccess, status: bridgeTxStatus } = useWaitForTransactionReceipt({
    hash: bridgeHash,
  })

  return (
    isShowInfo
      // true
      // TODO: refactor to support reverse direction
      ? <TransferInfo isBridgeLoading={isBridgeLoading}
        isBridgeSuccess={isBridgeSuccess}
        bridgeHash={bridgeHash}
        destinationAddress={destinationAddress}
        bridgeTxStatus={bridgeTxStatus}
        amount={amount}
        onClickBack={() => setIsBridgeTransactionSent(false)}
      // className={`${tabIndex == 0 ? "block" : "hidden"}`}>
      >
      </TransferInfo>
      // ? <TransferInfo isBridgeLoading={true} 
      //   isBridgeSuccess={true}
      //   destinationAddress={"UQC_pxTeZV0YIxOhOWRyJpuni-ab-68Akldrl6pvhZ3BcgV8"}
      //   bridgeTxStatus={bridgeTxStatus}
      //   bridgeHash={"0x111848c5de1389edd9e18c9b80c9b4e5c5186725e5f55ee77cf01044ed6233f7"}
      //   amount={"0.05"}
      //   onClickBack={() => setIsShowInfo(false)}>
      // </TransferInfo>
      : <div>
        <div className="form-group mt-8">
          <div className='flex mx-5 mb-2'>
            <div className='flex-1 text-left font-medium'>Asset</div>
          </div>
          <NetworkSelector onSelect={(newDirection) => console.log(newDirection)}></NetworkSelector>
        </div>
        <TransferAssetsInputsEVM onBridgeTransactionSent={(isSent) => setIsBridgeTransactionSent(isSent)} />
        <div className='font-medium text-sm text-gray-400'>
          {/* <div>Bridge fee: {networkConfig.bridgeFee} TON </div> */}
          <div>Network fee: 0.0002 BNB + 0.008 TON</div>
        </div>
      </div>
  )
}



export default TransferAssetsTab;