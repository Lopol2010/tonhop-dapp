import { ConnectKitButton } from 'connectkit';
import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';
import { useAccount, useBalance, useConfig, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { bridgeAbi } from '../../generated';
import { networkConfig } from '../../networkConfig';
import { formatWTON, hasTestnetFlag, isValidTonAddress, parseWTON, stripDecimals } from '../../utils/utils';
import { HistoryEntry, saveHistoryEntry } from '../HistoryStorage';
import TextInput from './TextInput';
import TransferAssetsInputs from './TransferAssetsInputs';

interface TransferAssetsInputsEVMProps {
  onBridgeTransactionSent: (data: {
    transactionSenderAddress: string | undefined,
    transactionHash: `0x${string}` | undefined,
    destinationAddress: string | undefined,
    amount: string
  }) => void
}

const TransferAssetsInputsEVM: React.FC<TransferAssetsInputsEVMProps> = ({ onBridgeTransactionSent }) => {
  const [warning, setWarning] = useState("");
  const [isValidAmountString, setIsValidAmountString] = useState(false);
  const [amount, setAmount] = useState("");
  const [bridgeChain, setBridgeChain] = useState(networkConfig.bnb.chain);
  const [allowance, setAllowance] = useState(0n);
  const [isShowInfo, setIsShowInfo] = useState(false);
  const { chains, switchChain } = useSwitchChain()
  const [destinationAddress, setDestinationAddress] = useState("");
  const { address, chainId, chain, isConnected } = useAccount();
  const config = useConfig();
  const [tabIndex, setTabIndex] = useState(0);

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

  const handleValidation = (() => {
    setIsValidAmountString(false);
    if (amount) {

      if (!amount.match(/^\d+(\.\d+)?$/g)) {
        setWarning("Invalid amount");
        return;
      }

      if (parseWTON(amount) < parseWTON(networkConfig.bnb.minAmount)) {
        setWarning(`Minimum amount is ${networkConfig.bnb.minAmount} TON`);
        return;
      }

      if (wtonBalance && parseWTON(amount) > wtonBalance.value) {
        setWarning("Insufficient WTON balance");
        return;
      }
    } else {
      setWarning("Enter an amount");
      return;
    }
    setIsValidAmountString(true);

    if (destinationAddress) {
      if (!isValidTonAddress(destinationAddress)) {
        setWarning("Invalid destination TON address");
        return;
      }

      // warn when address has testnet flag and wallet is on mainnet 
      if (hasTestnetFlag(destinationAddress) && !chain?.testnet) {
        setWarning("Destination address has testnet flag");
        return;
      }
    } else {
      setWarning("Enter recipient address");
      return;
    }

    setWarning("");
  });

// TODO:
  // useEffect(() => {
  //   if (!isBridgeSuccess || !bridgeHash) return;

  //   let newHistoryEntry: HistoryEntry = {
  //     date: Date.now(),
  //     bridgeRecievedAmount: amount,
  //     destinationAddress: destinationAddress,
  //     bnb: {
  //       txHash: bridgeHash,
  //       status: bridgeTxStatus,
  //     }
  //   };

  //   saveHistoryEntry(newHistoryEntry)

  // }, [isBridgeSuccess, bridgeHash]);

  useEffect(() => {
    if (bridgeRequestStatus === "success" && bridgeHash) {
      onBridgeTransactionSent({
        transactionSenderAddress: address,
        destinationAddress,
        amount,
        transactionHash: bridgeHash
      })
    }
  }, [bridgeRequestStatus, bridgeHash])

  useEffect(() => {
    if (!isBridgeSuccess) return;
    refetchBalance().then(data => { });
  }, [isBridgeSuccess, refetchBalance])

  useEffect(() => {
    handleValidation();
  }, [amount, destinationAddress])

  useEffect(() => {
    if (!address) return;

    // timeout is for throttling
    let timeoutID = setTimeout(() => {
      // TODO: should rethink how allowance is fetched, because 'approve' button blinks sometimes
      readContract(config, {
        abi: erc20Abi,
        address: import.meta.env.VITE_WTON_ADDRESS,
        functionName: "allowance",
        args: [address, import.meta.env.VITE_BRIDGE_ADDRESS],
      }).then(data => {
        setAllowance(data);
      });
    }, 100);
    return () => clearTimeout(timeoutID);
  }, [config, address, amount])

  const handleApprove = () => {
    let parsedAmount = 0n;
    parsedAmount = parseWTON(amount);

    writeApproval({
      address: import.meta.env.VITE_WTON_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [import.meta.env.VITE_BRIDGE_ADDRESS, BigInt(parsedAmount)]
    })
  }

  const handleTransfer = () => {
    let parsedAmount = 0n;
    parsedAmount = parseWTON(amount);

    writeBridge({
      address: import.meta.env.VITE_BRIDGE_ADDRESS,
      abi: bridgeAbi,
      functionName: "bridge",
      args: [BigInt(parsedAmount), destinationAddress]
    })
  }

  const onAmountInputChange = (e: React.ChangeEvent) => {
    let value = (e.target as HTMLInputElement).value;
    if (value.match(/^\d*(\.\d*)?$/g)) {
      setAmount(value);
    }
  }

  function getButton() {
    if (!isConnected) {
      return <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
          return (
            <button onClick={show} className='button'> Connect Wallet </button>
          );
        }}
      </ConnectKitButton.Custom>
    }

    if (chainId !== bridgeChain.id) {
      return <button className='button' onClick={() => { switchChain({ chainId: bridgeChain.id }) }}>{`Connect to ${bridgeChain.name}`}</button>
    }

    if (warning) {
      return <button className={"button button-disabled cursor-not-allowed"}> {warning} </button>;
    }

    if (allowance < parseWTON(amount) && bridgeRequestStatus == 'idle' && !isBridgeLoading) {
      if ((approvalRequestStatus === "idle" || approvalRequestStatus === "error") && !isApprovalLoading && !isApprovalSuccess) {
        return <button className={`button`} onClick={() => { handleApprove(); }}> {"Approve"} </button>
      }
    }

    if (approvalRequestStatus === "pending" || isApprovalLoading) {
      return <button className={`button button-disabled cursor-not-allowed`}> {"Wait for confirmation..."} </button>
    }
    if (bridgeRequestStatus === "pending" || isBridgeLoading) {
      return <button className={`button button-disabled cursor-not-allowed`}> {"Wait for confirmation..."} </button>
    }

    return <button className={`button`} onClick={() => { handleTransfer(); }}> {"Bridge"} </button>
  }

  function getFormattedEstimatedReceiveAmount() {
    return !isValidAmountString
      ? ""
      : <div className='font-medium  text-gray-400'>
        You'll receive ~{stripDecimals(formatWTON(parseWTON(amount) - parseWTON("0.008")))} Toncoin
      </div>
  }

  return (
    <TransferAssetsInputs userBalance={(wtonBalance ? wtonBalance.value : 0n)}
      mainButton={getButton()}
      amountInput={<TextInput value={amount} onChange={onAmountInputChange} placeholder='0.0' />}
      destinationAddressInput={<TextInput value={destinationAddress} onChange={e => { setDestinationAddress(e.target.value); }} placeholder='TON address...' />}
      formattedEstimatedReceiveAmount={getFormattedEstimatedReceiveAmount()}
      onClickUserBalance={() => wtonBalance && setAmount(formatWTON(wtonBalance.value))}
    />
  )
}



export default TransferAssetsInputsEVM;