// src/components/TransferAssets.js

import { ClassAttributes, useCallback, useEffect, useRef, useState } from 'react';
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
import { Address, CommonMessageInfo, CommonMessageInfoInternal, TonClient, Transaction } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { getHistoryEntryByTxHash, saveHistoryEntry } from './HistoryStorage';

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
  const reff = useRef(true);

  type MyTransactionType = Transaction & {
    inMessage: CommonMessageInfoInternal & {
      info: CommonMessageInfo & {
        src: Address
      }
    }
  }

  const [destinationTx, setDestinationTx] = useState<MyTransactionType>();

  const txStatusConfig = {
    "success": { text: "Success!", className: "text-green-500" },
    "pending": { text: "Confirming...", className: "dark:text-gray-300" },
    "error": { text: "Failed.", className: "text-red-500" },
  };

  const { text: txStatusText, className: txStatusClassName } = txStatusConfig[bridgeTxStatus];

  useEffect(() => {
    if (!destinationTx) return;


  }, [destinationTx]);

  useEffect(() => {
    if (!isBridgeSuccess || !bridgeHash) return;


    // console.log(isBridgeSuccess, bridgeHash, destinationAddress)

    async function findLastTransaction(predicate: (txHash: string) => boolean) {
      const client = new TonClient({
        endpoint: await getHttpEndpoint({ network: networkConfig.ton.network }),
      });

      const destAddressParsed = Address.parse(destinationAddress);
      const txs = (await client.getTransactions(destAddressParsed, {
        limit: 10,
        archival: true
      })).filter((tx): tx is MyTransactionType => {
        return !!tx.inMessage && !!tx.inMessage.info.src && !!tx.inMessage.info.dest
          && tx.inMessage.info.src.toString() === networkConfig.ton.highloadWalletAddress.toString()
          && tx.inMessage.info.dest.toString() === destAddressParsed.toString()
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

        if (predicate(evmTxHash)) return txs[i];
      }
      return null;
    }

    (async () => {
      let RETRY_ATTEMPTS = 30;
      let RETRY_INTERVAL = 2000;
      let destinationTx;
      for (let i = 0; i < RETRY_ATTEMPTS; i++) {
        console.log("attempt to search for TON transaction");
        try {
          destinationTx = await findLastTransaction((txHash) => {
            return txHash == bridgeHash;
          });
        } catch (error) { console.log("Failed attempt to find TON transaction:", error); }

        if (destinationTx) break;

        await new Promise((resolve) => { setTimeout(resolve, RETRY_INTERVAL); })

      }

      if (destinationTx) {
        setDestinationTx(destinationTx)

        let historyEntry = getHistoryEntryByTxHash(bridgeHash);
        if (historyEntry && !historyEntry.ton) {
          let coins = (destinationTx.inMessage.info as CommonMessageInfoInternal).value.coins;
          historyEntry.destinationReceivedAmount = coins;
          historyEntry.ton = {
            txHash: destinationTx.hash().toString("hex"),
            txLt: destinationTx.lt
          }
          saveHistoryEntry(historyEntry);
        }
      } else {
        console.log("Failed to find TON transaction for " + bridgeHash);
      }
    })()

  }, [isBridgeSuccess, bridgeHash]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const stopCountdown = () => {
      clearInterval(intervalId);
      setConfirmationCountdown(0.0);
    };

    if (isBridgeLoading || isBridgeSuccess) {
      setConfirmationCountdown(isBridgeSuccess ? 30.0 : 7.0);
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
  }, [isBridgeLoading, isBridgeSuccess])


  function formatTxHexHash(hash: string) {
    return hash.replace(/^(\w{6})\w+(\w{5})$/g, "$1...$2");
  }

  function getFormattedToncoinAmountReceivedByDestination() {
    return stripDecimals(formatUnits((destinationTx?.inMessage.info as CommonMessageInfoInternal).value.coins, networkConfig.ton.tonDecimals))
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
            </div>
            <div className='flex-1 text-left' >
              <div className=' font-medium '>{amount ? amount + " WTON" : "-"}</div>
              <div className=' font-medium '>
                <a className='flex dark:text-blue-400' href={bridgeHash ? networkConfig.bsc.getExplorerLink(bridgeHash) : ""} target='_blank'>
                  <span className=''>
                    {bridgeHash ? formatTxHexHash(bridgeHash) : "-"}
                  </span>
                </a>
              </div>
              <div className={`font-medium ${txStatusClassName}`}>
                {txStatusText + " "}
                <span className='w-[4ch]'>
                  {
                    (bridgeHash && bridgeTxStatus === "pending" && confirmationCountdown > 0
                      ? confirmationCountdown.toString().replace(/\.(\d{2})\d*/g, ".$1")
                      : "")
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        // isBridgeSuccess
        <div className={`mx-5 text-left ${isBridgeSuccess ? "" : "text-gray-400"}`}>
          <div className='text-left font-medium text-lg'>TON chain:</div>
          <div className='flex mb-5 mx-5'>
            <div className='mr-5'>
              <div className=''>Destination received:</div>
              <div className=''>Transaction:</div>
            </div>
            <div className='flex-1'>
              <div className='font-medium'>{
                destinationTx
                  ? getFormattedToncoinAmountReceivedByDestination() + " TON"
                  : "-"
              }
              </div>
              <a className={`flex ${destinationTx ? "dark:text-blue-400" : "cursor-default text-inherit hover:text-inherit"}`}
                href={destinationTx ? networkConfig.ton.getExplorerLink(destinationTx.hash().toString('hex')) : ""}
                onClick={e => destinationTx || e.preventDefault()} target='_blank'>
                <span className='whitespace-pre'>
                  {
                    destinationTx
                      ? formatTxHexHash("0x" + destinationTx.hash().toString('hex'))
                      : isBridgeSuccess
                        ? confirmationCountdown > 0
                          ? "Searching... "
                          : ""
                        : "-"
                  }
                </span>
                
                  {
                    isBridgeSuccess
                      ? destinationTx
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
      }
    </div>

    <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700"
      onClick={() => {
        onClickBack()
      }}>
      Back
    </button>
  </div >


}

export default TransferInfo;