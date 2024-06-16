// src/components/TransferAssets.js

import React, { useEffect, useState } from 'react';
import '../App.css';
import NetworkSelector from './NetworkSelector';
import { useAccount, useBalance, useReadContract, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { bridgeAbi } from '../generated';
import warningSign from '../assets/warning.webp';
import { erc20Abi, formatUnits, parseUnits } from 'viem';

const TransferAssets = () => {
  const [asset, setAsset] = useState('TON');
  const [fromNetwork, setFromNetwork] = useState('Ethereum Network');
  const [toNetwork, setToNetwork] = useState('Polygon Network');
  const [amount, setAmount] = useState("0.0");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [balance, setBalance] = useState("-");
  const {address} = useAccount();

    console.log(address)
  const { data } = useBalance({
      token: import.meta.env.VITE_WTON_ADDRESS,
      address: address
  });

  useEffect(() => {
    if(data) {
      // format balance to display max 4 decimals
      setBalance(formatUnits(data.value, 18).replace(/(\d+)(\.?\d{0,4})\d*/g, "$1$2"));
    }
  }, [data])

  const {
    data: hash,
    error,
    isPending,
    writeContract
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleTransfer = () => {
    console.log(`Transferring ${amount} ${asset} from ${fromNetwork} to ${toNetwork}`);
    // TODO: validate amount, maybe use form validation lib or smth like that
    // TODO: validate addr
    if (!destinationAddress) return;

    // TODO: should parse amount, because user could input any string right now
    let parsedAmount = 0n;
    parsedAmount = parseUnits(amount.replace(/,/g, "."), 18);

    writeContract({
      address: import.meta.env.VITE_BRIDGE_ADDRESS,
      abi: bridgeAbi,
      functionName: "bridge",
      args: [BigInt(parsedAmount), destinationAddress]
    })
  } 

  return (
    <div className="transfer-assets">
      <div className='flex mx-5 mb-5'>
        <div className=''>
          <h3 className='text-left text-lg font-bold'>Transfer Assets</h3>
          <hr className='border-b-2 border-blue-500'></hr>
        </div>
        <div className=''>
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
          <div className='flex-1 text-right font-medium'><span className='text-gray-400'>balance: </span>{balance}</div>
        </div>
        <input className='mb-5' type="text" value={amount} onChange={e => setAmount(e.target.value)} />
      {/* <div className="info-warning flex">
        <div className='flex-0'>
          <img className='h-9' src={warningSign} />
        </div>
        <div className='flex-5 mx-5 content-center'><p>Minimum amount is 0.05 TON</p></div>
      </div> */}
        <div className='flex mx-5 mb-2'>
          <div className='flex-1 text-left font-medium'>Recipient</div>
        </div>
        <input type="text" value={destinationAddress} onChange={e => setDestinationAddress(e.target.value)} />

      </div>
      <button className={`button ${amount > 0 && destinationAddress ? "" : "button-disabled"}`} onClick={handleTransfer}>Bridge</button>
    </div>
  );
}

export default TransferAssets;