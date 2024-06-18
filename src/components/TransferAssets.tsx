// src/components/TransferAssets.js

import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useAccount, useAccountEffect, useBalance, useConfig, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { bridgeAbi } from '../generated';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { networkConfig } from '../networkConfig';
import warningSign from "../assets/warning.webp"
import { hasTestnetFlag, isValidTonAddress } from '../utils';
import { ConnectKitButton } from 'connectkit';
import { readContract } from 'wagmi/actions';

const TransferAssets = () => {
  // const [asset] = useState('TON');
  // const [fromNetwork] = useState('Ethereum Network');
  // const [toNetwork] = useState('Polygon Network');
  const [warning, setWarning] = useState("");
  const [amount, setAmount] = useState("");
  const [bridgeChain, setBridgeChain] = useState(networkConfig.bsc.chain);
  const [allowance, setAllowance] = useState(0n);
  const { chains, switchChain } = useSwitchChain()
  // const [buttonText, setButtonText] = useState("Enter an amount");
  const [destinationAddress, setDestinationAddress] = useState("");
  // TODO: must force to send 'Bridge' transaction on correct chain! 
  const { address, chainId, chain, isConnected } = useAccount();
  const config = useConfig();

  const { data: wtonBalance } = useBalance({
    token: import.meta.env.VITE_WTON_ADDRESS,
    address: address
  });

  // transform bigint into string with 4 decimals
  function stripDecimals(amount: string) {
    return amount.replace(/(\d+)(\.?\d{0,4})\d*/g, "$1$2");
  }
  function formatWTON(value: bigint) {
    const formattedAmountString = formatUnits(value, networkConfig.bsc.wtonDecimals);
    return formattedAmountString;
  }

  let parseWTON = (amount: string) => parseUnits(amount, networkConfig.bsc.wtonDecimals);


  const {
    data: approveHash,
    // error,
    // isPending,
    status: sendApproveStatus,
    writeContract: sendApprove
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

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
        console.log(data);
      });
    }, 100);
    return () => clearTimeout(timeoutID);
  }, [config, address, amount])

  const handleApprove = () => {
    // TODO: validate addr
    if (!destinationAddress) return;

    let parsedAmount = 0n;
    parsedAmount = parseWTON(amount);

    sendApprove({
      address: import.meta.env.VITE_WTON_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [import.meta.env.VITE_BRIDGE_ADDRESS, BigInt(parsedAmount)]
    })
  }
  const handleTransfer = () => {
    // TODO: validate addr
    if (!destinationAddress) return;

    let parsedAmount = 0n;
    parsedAmount = parseWTON(amount);

    sendApprove({
      address: import.meta.env.VITE_BRIDGE_ADDRESS,
      abi: bridgeAbi,
      functionName: "bridge",
      args: [BigInt(parsedAmount), destinationAddress]
    })
  }

  function getButton() {
    console.log(sendApproveStatus, isApproveConfirmed);
    if (isConnected) {
      if(chainId !== bridgeChain.id) {
        return <button className={`button`} onClick={() => { switchChain({chainId: bridgeChain.id}); }}> 
            {`Connect to ${bridgeChain.name}`} 
          </button>
      }
      if (warning) {
        return <button className={"button button-disabled cursor-not-allowed"}> {warning} </button>;
      }
      if (allowance < parseWTON(amount)) {
        if((sendApproveStatus === "idle" || sendApproveStatus === "error") && !isApproveConfirming && !isApproveConfirmed) {
            return <button className={`button`} onClick={() => { handleApprove(); }}> {"Approve"} </button>
        }
        if (sendApproveStatus === "pending" || isApproveConfirming) {
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
    <div className="transfer-assets w-5/6 md:w-3/5 lg:w-2/5">
      <div className='flex mx-5 mb-5'>
        <div className='cursor-pointer' onClick={() => alert("TODO")}>
          <h3 className='text-left text-lg font-bold'>Transfer Assets</h3>
          <hr className='border-b-2 border-blue-500'></hr>
        </div>
        <div className='cursor-pointer' onClick={() => alert("TODO")}>
          <h3 className='ml-8 text-gray-400 text-left text-lg font-bold'>History</h3>
        </div>
      </div>
      <div className="form-group">
        {/* <div className='mx-5 mb-2 text-left font-medium'>Asset</div>
        <select value={asset} onChange={e => setAsset(e.target.value)}>
          <option value="TON">TON</option>
        </select> */}
      </div>
      <div className="form-group">
        {/* <NetworkSelector></NetworkSelector> */}
      </div>
      <div className="form-group">
        <div className='flex mx-5 mb-2'>
          <div className='flex-1 text-left font-medium'>Amount</div>
          <div className='flex-1 text-right font-medium'>
            <span className='text-gray-400'>balance: </span>
            {
              wtonBalance
                ? <span className='cursor-pointer' onClick={() => wtonBalance ? setAmount(formatWTON(wtonBalance.value)) : ""}>
                  {stripDecimals(formatWTON(wtonBalance.value))}
                </span>
                : "-"
            }
          </div>
        </div>
        <input className='bg-gray-100 outline-blue-500 mb-5' placeholder='0.0' type="text" value={amount} onChange={e => { setAmount(e.target.value); }} />
        <div className='flex mx-5 mb-2'>
          <div className='flex-1 text-left font-medium'>Recipient</div>
        </div>
        <input className='bg-gray-100 outline-blue-500' type="text" placeholder='TON address...' value={destinationAddress} onChange={e => { setDestinationAddress(e.target.value); }} />
      </div>
      { getButton() }
    </div>
  );
}

export default TransferAssets;