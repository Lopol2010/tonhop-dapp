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
import { Address, CommonMessageInfoInternal, TonClient, Transaction } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

interface TransferInfoProps {
  destinationAddress: string,
  isBridgeLoading: boolean,
  isBridgeSuccess: boolean,
  bridgeTxStatus: QueryStatus,
  bridgeHash: `0x${string}` | undefined,
  amount: string,
  onClickBack: () => void
}
const TransferInfo: React.FC<TransferInfoProps> = ({ destinationAddress, isBridgeLoading, isBridgeSuccess, bridgeTxStatus, bridgeHash, amount, onClickBack }) => {
  const [confirmationCountdown, setConfirmationCountdown] = useState(0.0);
  const [destinationTx, setDestinationTx] = useState<Transaction>();

  const txStatusConfig = {
    "success": { text: "Success!", className: "text-green-500" },
    "pending": { text: "Confirming...", className: "text-gray-500" },
    "error": { text: "Failed.", className: "text-red-500" },
  };

  const { text, className } = txStatusConfig[bridgeTxStatus];

  useEffect(() => {
    if (!isBridgeSuccess) return;

    async function findLastTransaction(predicate: (txHash: string) => boolean) {
      const client = new TonClient({
        endpoint: await getHttpEndpoint({ network: networkConfig.ton.network }),
      });

      const destAddressParsed = Address.parse(destinationAddress);
      const txs = (await client.getTransactions(destAddressParsed, {
        limit: 10,
        archival: true
      })).filter(tx => {
        // console.log("filter",         tx.inMessage?.info.src.equals(networkConfig.ton.highloadWalletAddress ),
        //          tx.inMessage.info.dest .toString(), destAddressParsed.toString())
        return tx.inMessage?.info.src?.toString() === networkConfig.ton.highloadWalletAddress.toString()
          && tx.inMessage.info.dest?.toString() === destAddressParsed.toString()
      });

      for (let i = 0; i < txs.length; i++) {
        const inMsg = txs[i].inMessage;

        if (!inMsg) continue;

        // TODO: handle unexpected payload
        let evmLogIndexFull = inMsg.body.beginParse().loadStringTail() + inMsg.body.beginParse().loadStringRefTail();
        // remove 4 bytes of zeroes
        evmLogIndexFull = evmLogIndexFull.trim().slice(4);

        const evmBlockHash = evmLogIndexFull.slice(0, 66);
        const evmTxHash = evmLogIndexFull.slice(66, 132);
        const evmLogIndex = evmLogIndexFull.slice(132);

        // console.log(evmBlockHash) 
        // console.log(evmTxHash) 
        // console.log(evmLogIndex) 
        if (predicate(evmTxHash)) return txs[i];
      }
      return null;
    }

    (async () => {
      let RETRY_ATTEMPTS = 15;
      let RETRY_INTERVAL = 3000;
      let destinationTx;
      for (let i = 0; i < RETRY_ATTEMPTS; i++) {
        console.log("attempt to search for TON transaction");
        try {
          destinationTx = await findLastTransaction((txHash) => {
            return txHash == bridgeHash;
          });
        } catch (error) { console.log("Error when attempted to find TON transaction:", error); }
        if (destinationTx) break;
        await new Promise((resolve) => { setTimeout(resolve, RETRY_INTERVAL); })
      }
      if(destinationTx) {
        setDestinationTx(destinationTx)
      }
      console.log("found tx:", destinationTx?.hash().toString("hex"), destinationTx?.lt);
    })()

  }, [isBridgeSuccess]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const stopCountdown = () => {
      clearInterval(intervalId);
      setConfirmationCountdown(0.0);
    };

    if (isBridgeLoading) {
      setConfirmationCountdown(8.0);
      // TODO: should rely on timestamp, because setInterval pauses when for example you switch windows
      intervalId = setInterval(() => {
        setConfirmationCountdown((currentValue) => {
          let newValue = currentValue - 0.05;
          if (newValue <= 0.1) {
            stopCountdown();
          }
          return newValue;
        });
      }, 50)
    }
    return stopCountdown;
  }, [isBridgeLoading])


  function formatTxHexHash(hash: string) {
    return hash.replace(/^(\w{6})\w+(\w{5})$/g, "$1...$2");
  }

  return <div>
    <div>
      <div className='mb-5 mx-5'>
        <div className="text-left font-medium text-lg">BSC chain</div>

        <div>
          <div className='flex mx-5 text-base'>
            <div className='mr-5 text-left'>
              <div className=''>Bridge received:</div>
              <div className=''>Transaction:</div>
              <div className='text-left '>Status: </div>
              <div className={`text-left `}>Estimated time: </div>
            </div>
            <div className='flex-1 text-left' >
              <div className=' font-medium '>{amount ? amount + " WTON" : "-"}</div>
              <div className=' font-medium '>
                <a className='flex' href={bridgeHash ? networkConfig.bsc.getExplorerLink(bridgeHash) : ""}>
                  <span className=''>
                    {bridgeHash ? formatTxHexHash(bridgeHash) : "-"}
                  </span>
                  <span className='content-center ml-2'>
                    <img className='w-4' src="link.png"></img>
                  </span>
                </a>
              </div>
              <div className={`font-medium ${className}`}>
                {text}
              </div>
              <div className={`font-medium text-black-500`}>
                {
                  bridgeHash
                    ? confirmationCountdown.toString().replace(/\.(\d{2})\d*/g, ".$1")
                    : "-"
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        isBridgeSuccess
          ? <div className='mx-5 text-left'>
            <div className='text-left font-medium text-lg'>TON chain:</div>
            <div className='flex mb-5'>
              <div className='mr-5'>
                <div className=''>Destination received:</div>
                <div className=''>Transaction:</div>
              </div>
              <div className='flex-1'>
                <div className=''>{destinationTx && destinationTx.inMessage 
                  ?  stripDecimals(formatUnits((destinationTx.inMessage.info as CommonMessageInfoInternal).value.coins, networkConfig.ton.tonDecimals)) + " TON"
                  :  "0"
                } 
                </div>
                <a className='flex' href={destinationTx ? networkConfig.ton.getExplorerLink(destinationTx.hash().toString('hex')) : ""}>
                  <span className=''>{destinationTx ? formatTxHexHash("0x" + destinationTx.hash().toString('hex')) : "Searching transaction..."}</span>
                  <span className='content-center ml-2'>
                    <img className='w-4' src="link.png"></img>
                  </span>
                </a>
              </div>
            </div>
          </div>
          : ""
      }
    </div>

    <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300"
      onClick={() => onClickBack()}>
      Back
    </button>
  </div >


}

export default TransferInfo;