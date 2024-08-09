import { useEffect, useState } from 'react';
import { erc20Abi, formatUnits, isAddress, Transaction as EVMTransaction, createPublicClient, WatchContractEventReturnType } from 'viem';
import { networkConfig } from '../../networkConfig';
import { stripDecimals } from '../../utils/utils';
import { QueryStatus } from '@tanstack/react-query';
import { Address, CommonMessageInfoInternal, Transaction } from '@ton/ton';
import { getHistoryEntryByTxHash, saveHistoryEntry } from '../HistoryStorage';
import { ChainName } from '../../types/ChainName';
import useFindTonTransaction from '../../hooks/useFindTonTransaction';
import IncomingEVMTxInfo from './IncomingEVMTxInfo';
import OutgoingTONTxInfo from './OutgoingTONTxInfo';
import OutgoingEVMTxInfo from './OutgoingEVMTxInfo';
import IncomingTONTxInfo from './IncomingTONTxInfo';
import { useClient, useConfig, usePublicClient, useWatchContractEvent } from 'wagmi';
import { getBlockNumber, watchContractEvent } from 'wagmi/actions';

interface TransferInfoTONToBNBProps {
  destinationAddress: `0x${string}` | undefined,
  amount: string | undefined,
  transactionSenderAddress: string | undefined,
  onClickBack: () => void
}

const TransferInfoTONToBNB: React.FC<TransferInfoTONToBNBProps> = ({ transactionSenderAddress, destinationAddress, amount, onClickBack }) => {

  const incomingTransaction = useFindTonTransaction(
    networkConfig.ton.highloadWalletAddress.toString(),
    (tx: Transaction) => {
      if (!transactionSenderAddress || !destinationAddress || !tx.inMessage?.info.src || !tx.inMessage.info.dest
        || !(tx.inMessage.info.src as Address).equals(Address.parse(transactionSenderAddress))
        || !(tx.inMessage.info.dest as Address).equals(networkConfig.ton.highloadWalletAddress)) {
        return false;
      }

      let payloadString;
      let extractedDestinationAddress;
      try {
        payloadString = tx.inMessage.body.beginParse().loadStringTail();
        if (tx.inMessage.body.beginParse().remainingRefs == 1) {
          payloadString += tx.inMessage.body.beginParse().loadStringRefTail();
        }
        // remove 4 bytes of zeroes
        payloadString = payloadString.trim().slice(4);
        extractedDestinationAddress = payloadString.slice(0, 42);
      } catch (error) {
        console.log("error parsing payload:", error);
        return false;
      }

      if (!isAddress(extractedDestinationAddress)) return false;

      return true;

    });

  const [outgoingTransaction, setOutgoingTransaction] = useState<`0x${string}`>();
  useWatchContractEvent({
    address: networkConfig.bnb.wtonAddress,
    abi: erc20Abi,
    eventName: "Transfer",
    args: {
      from: networkConfig.bnb.bridgeWalletAddress,
      to: destinationAddress
    },
    onError: err => {
      console.log("error watching transfer events");
      console.dir(err)
    },
    onLogs: logs => {
      console.log("new logs:", logs)
      logs.forEach(log => {
        console.log(log.args.to , log.args.from
              , log.args.to && isAddress(log.args.to) , log.args.from && isAddress(log.args.from)
              , log.args.from == networkConfig.bnb.bridgeWalletAddress
              , log.args.to == destinationAddress);
        if (log.args.to && log.args.from
              && isAddress(log.args.to) && isAddress(log.args.from)
              && log.args.from == networkConfig.bnb.bridgeWalletAddress
              && log.args.to == destinationAddress && log.transactionHash) {
          setOutgoingTransaction(log.transactionHash);
        }
      });
    }
  });
  // const config = useConfig();
  // const client = usePublicClient({config});
  // const [w, setw] = useState<WatchContractEventReturnType>();
  // useEffect(() => {
  //   if (!client || !destinationAddress) return;

  //   if (!w) {
  //     console.log("[BNBWatcher] listening at:", networkConfig.bnb.wtonAddress);
      
      
  //     // getBlockNumber(client).then(n => console.log("Block", n))
      
  //     let unwatch = client.watchContractEvent( {
  //       abi: erc20Abi,
  //       // TODO: try to use dest addr here
  //       address: networkConfig.bnb.wtonAddress,
  //       // eventName: "Transfer",
  //       // fromBlock: 42835172n,
  //       onError: err => { console.log("[Listener] Error:");  console.dir(err); },
  //       onLogs: logs => {
  //         console.log("new logs:", logs)
  //         logs.forEach(log => {
  //           // console.log(log.args.to, log.args.from
  //           //   , log.args.to && isAddress(log.args.to), log.args.from && isAddress(log.args.from)
  //           //   , log.args.from == networkConfig.bnb.bridgeWalletAddress
  //           //   , log.args.to == destinationAddress);
  //           // if (log.args.to && log.args.from
  //           //   && isAddress(log.args.to) && isAddress(log.args.from)
  //           //   && log.args.from == networkConfig.bnb.bridgeWalletAddress
  //           //   && log.args.to == destinationAddress) {
  //           //   setOutgoingTransaction(outgoingTransaction);
  //           // }
  //         })
  //       }
  //     });
  //     setw(unwatch);
  //     return () => { unwatch(); setw(undefined); console.log("[BNBWatcher] unwatch") };
  //   }
  //   return () => { if(w) {w(); setw(undefined); console.log("[BNBWatcher] unwatch")} };
  // }, [destinationAddress, client])

  // useEffect(() => {
  //   if (!incomingTransaction) return;

  //   let historyEntry = getHistoryEntryByTxHash(transactionHash as string);
  //   if (historyEntry && !historyEntry.ton) {
  //     let toncoinAmount = (incomingTransaction.inMessage.info as CommonMessageInfoInternal).value.coins;
  //     // historyEntry.destinationReceivedAmount = toncoinAmount;
  //     historyEntry.ton = {
  //       txHash: incomingTransaction.hash().toString("hex"),
  //       txLt: incomingTransaction.lt
  //     }
  //     saveHistoryEntry(historyEntry);
  //   }
  // }, [incomingTransaction]);

  function formatTxHexHash(hash: string) {
    return hash.replace(/^(\w{6})\w+(\w{5})$/g, "$1...$2");
  }

  function getFormattedToncoinAmountReceivedByDestination() {
    if (!incomingTransaction) return undefined;
    return stripDecimals(
      formatUnits(
        (incomingTransaction.inMessage?.info as CommonMessageInfoInternal).value.coins,
        networkConfig.ton.tonDecimals
      )
    );
  }

  return <div>

    <IncomingTONTxInfo destinationAddress={destinationAddress}
      transactionHash={incomingTransaction?.hash().toString("base64")}
      transactionLT={incomingTransaction?.lt}
      amount={getFormattedToncoinAmountReceivedByDestination()}
      isActive={true}
    />

    <OutgoingEVMTxInfo transactionHash={outgoingTransaction}
      transactionStatus={"pending"}
      destinationAddress={destinationAddress}
      amount={amount}
    />

    <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700"
      onClick={() => { onClickBack() }}> Back </button>

  </div >


}

export default TransferInfoTONToBNB;