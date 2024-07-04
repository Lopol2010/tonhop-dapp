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

const TransferAssets = () => {
  const [warning, setWarning] = useState("");
  const [amount, setAmount] = useState("");
  const [bridgeChain, setBridgeChain] = useState(networkConfig.bsc.chain);
  const [allowance, setAllowance] = useState(0n);
  const [isShowInfo, setIsShowInfo] = useState(false);
  const { chains, switchChain } = useSwitchChain()
  const [destinationAddress, setDestinationAddress] = useState("");
  const { address, chainId, chain, isConnected } = useAccount();
  const config = useConfig();

  const { data: wtonBalance, refetch: refetchBalance } = useBalance({
    token: import.meta.env.VITE_WTON_ADDRESS,
    address: address
  });

  const { writeContract: writeApproval, data: approveHash, status: approvalStatus } = useWriteContract()
  const { writeContract: writeBridge, data: bridgeHash, status: bridgeStatus } = useWriteContract()

  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { isLoading: isBridgeLoading, isSuccess: isBridgeSuccess } = useWaitForTransactionReceipt({
    hash: bridgeHash,
  })


  const handleValidation = (() => {
    if (amount) {

      if (!amount.match(/^\d+(\.\d+)?$/g)) {
        setWarning("Invalid amount");
        return;
      }

      if (parseWTON(amount) < parseWTON(networkConfig.bsc.minAmount)) {
        setWarning(`Minimum amount is ${networkConfig.bsc.minAmount} TON`);
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

  useEffect(() => {
    if(bridgeStatus === "success") {
      setIsShowInfo(true);
    } else {
      setIsShowInfo(false);
    }
  }, [bridgeStatus])

  useEffect(() => {
    if (!isBridgeSuccess) return;
    refetchBalance().then(data => { });
  }, [isBridgeSuccess, refetchBalance])

  useEffect(() => {
    handleValidation();
  }, [amount, destinationAddress])

  useEffect(() => {
    if (!address || !amount) return;

    // timeout is for throttling
    let timeoutID = setTimeout(() => {
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

  function getBridgeTransferInfo() {
    return <div>
      <div>
        <div className='flex mb-5 mx-5'>
          <div className="flex text-left font-medium">BSC transaction:</div>
          <div className='flex mx-5'>{bridgeHash ? bridgeHash.slice(0, 10) + "..." : "none"}</div>
          <div className='flex-1 text-right ml-2'>
            {
              isBridgeSuccess
                ? <span className='text-green-500'>Success!</span>
                : bridgeHash 
                  ? <span className='text-black-500'>Confirming...</span>
                  : ""
            }
          </div>
        </div>
        <div className='flex w-max mb-5'>

          <div className='mx-5 text-left font-medium'>TON transaction:</div>
          <div>{"none"}</div>
        </div>
      </div>

      <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300"
              onClick={() => setIsShowInfo(false)}>
        Back
      </button>
    </div>
  }

  function getButton() {
    if (isConnected) {
      if (chainId !== bridgeChain.id) {
        return <button className={`button`} onClick={() => { switchChain({ chainId: bridgeChain.id }); }}>
          {`Connect to ${bridgeChain.name}`}
        </button>
      }
      if (warning) {
        return <button className={"button button-disabled cursor-not-allowed"}> {warning} </button>;
      }
      if (allowance < parseWTON(amount)) {
        if ((approvalStatus === "idle" || approvalStatus === "error") && !isApprovalLoading && !isApprovalSuccess) {
          return <button className={`button`} onClick={() => { handleApprove(); }}> {"Approve"} </button>
        }
        if (approvalStatus === "pending" || isApprovalLoading) {
          return <button className={`button button-disabled cursor-not-allowed`}> {"Wait for confirmation..."} </button>
        }
      } else {
        if ((bridgeStatus === "idle" || bridgeStatus === "error") && !isBridgeLoading && !isBridgeSuccess) {
          return <button className={`button`} onClick={() => { handleTransfer(); }}> {"Bridge"} </button>
        }
        if (bridgeStatus === "pending") {
          return <button className={`button button-disabled cursor-not-allowed`}> {"Wait for confirmation..."} </button>
        }
      }
      return <button className={`button`} onClick={() => { handleTransfer(); }}> {"Bridge"} </button>
    } else {
      return <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
          return (
            <button onClick={show} className='button'> Connect Wallet </button>
          );
        }}
      </ConnectKitButton.Custom>
    }
  }

  return (
    <div className="transfer-assets dark:bg-gray-800 w-5/6 md:w-3/5 lg:w-2/5">
      <div className='flex mx-5 mb-5'>
        <div className='cursor-pointer' onClick={() => alert("TODO")}>
          <h3 className='text-left text-lg font-bold'>Transfer Assets</h3>
          <hr className='border-b-2 border-blue-500'></hr>
        </div>
        <div className='cursor-pointer' onClick={() => alert("TODO")}>
          <h3 className='ml-8 text-gray-400 dark:text-gray-400 text-left text-lg font-bold'>History</h3>
        </div>
      </div>
      {
        // true || isBridgeLoading || bridgeStatus === "pending" || bridgeStatus === "success"
        isShowInfo
        // true
          ? getBridgeTransferInfo()
          : <div>
            <div className="form-group">
              <div className='flex mx-5 mb-2'>
                <div className='flex-1 text-left font-medium'>Amount</div>
                <div className='flex-1 text-right font-medium'>
                  <span className='text-gray-400'>balance: </span>
                  {
                    wtonBalance
                      ? <span className='cursor-pointer dark:text-gray-300' onClick={() => wtonBalance ? setAmount(formatWTON(wtonBalance.value)) : ""}>
                        {stripDecimals(formatWTON(wtonBalance.value))}
                      </span>
                      : "-"
                  }
                </div>
              </div>
              <input className="w-[calc(100%-40px)]
                          p-3 mx-5 mb-5
                          bg-gray-100
                          outline-blue-500
                          border border-solid border-gray-300 rounded-md
                          dark:bg-gray-700
                          dark:border-none
                          dark:outline-gray-100"
                placeholder='0.0' type="text" value={amount} onChange={onAmountInputChange} />

              <div className='flex mx-5 mb-2'>
                <div className='flex-1 text-left font-medium'>Recipient</div>
              </div>
              <input className="w-[calc(100%-40px)]
                          p-3 mx-5 mb-5
                          bg-gray-100 
                          outline-blue-500
                          border border-solid border-gray-300 rounded-md
                          dark:bg-gray-700
                          dark:border-none
                          dark:outline-gray-100"
                type="text" placeholder='TON address...' value={destinationAddress} onChange={e => { setDestinationAddress(e.target.value); }} />
            </div>
            {getButton()}
          </div>
      }
    </div>
  );
}

export default TransferAssets;