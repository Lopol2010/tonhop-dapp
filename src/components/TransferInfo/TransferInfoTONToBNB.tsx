import { useCallback, useEffect, useState } from 'react';
import { erc20Abi, formatUnits, isAddress, Transaction as EVMTransaction, createPublicClient, WatchContractEventReturnType } from 'viem';
import { networkConfig } from '../../networkConfig';
import { stripDecimals } from '../../utils/utils';
import { QueryStatus } from '@tanstack/react-query';
import { Address, CommonMessageInfoInternal, Transaction } from '@ton/ton';
import { CrosschainTransfer, getHistoryEntryById, saveHistoryEntry } from '../HistoryStorage';
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
  memo: string | undefined,
  transferStartTimestamp: number,
  onClickBack: () => void
}

const TransferInfoTONToBNB: React.FC<TransferInfoTONToBNBProps> = ({ memo, transferStartTimestamp, transactionSenderAddress, destinationAddress, amount, onClickBack }) => {

  const [outgoingTransaction, setOutgoingTransaction] = useState<`0x${string}`>();

  function extractPayload(tx: Transaction) {
    if (!tx.inMessage) return null;

    let payloadString;
    let extractedDestinationAddress;
    let extractedMemo;
    try {
      payloadString = tx.inMessage.body.beginParse().loadStringTail();
      if (tx.inMessage.body.beginParse().remainingRefs == 1) {
        payloadString += tx.inMessage.body.beginParse().loadStringRefTail();
      }
      // remove 4 bytes of zeroes
      payloadString = payloadString.trim().slice(4);
      extractedDestinationAddress = payloadString.slice(0, 42);
      extractedMemo = payloadString.slice(43);
    } catch (error) {
      console.log("error parsing payload:", error);
      return null;
    }
    return { extractedDestinationAddress, extractedMemo }
  }

  console.log("transferStartTimestamp", transferStartTimestamp, memo)
  const incomingTransaction = useFindTonTransaction(
    networkConfig.ton.highloadWalletAddress.toString(),
    transferStartTimestamp,
    useCallback((tx: Transaction) => {
      console.log(tx)
      if (!transactionSenderAddress || !destinationAddress || !tx.inMessage?.info.src || !tx.inMessage.info.dest
        || !(tx.inMessage.info.src as Address).equals(Address.parse(transactionSenderAddress))
        || !(tx.inMessage.info.dest as Address).equals(networkConfig.ton.highloadWalletAddress)) {
        return false;
      }

      const payload = extractPayload(tx);
      if (!payload || !isAddress(payload.extractedDestinationAddress) || payload.extractedMemo != memo) return false;

      return true;

    }, [destinationAddress, transactionSenderAddress]));

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
        if (log.args.from == networkConfig.bnb.bridgeWalletAddress
          && log.args.to == destinationAddress
          && log.transactionHash) {
          setOutgoingTransaction(log.transactionHash);
        }
      });
    }
  });

  useEffect(() => {
    if (!incomingTransaction || !incomingTransaction.inMessage || !destinationAddress) return;

    let inTxHash = incomingTransaction.hash().toString("base64");
    let isAlreadyStored = getHistoryEntryById(inTxHash as string) !== undefined;
    if (isAlreadyStored) return;

    let extractedPayload = extractPayload(incomingTransaction);
    if(!extractedPayload) return;

    let toncoinAmount = (incomingTransaction.inMessage.info as CommonMessageInfoInternal).value.coins
      - incomingTransaction.totalFees.coins;
    let historyEntry: CrosschainTransfer = {
      id: inTxHash,
      createdAt: Date.now() / 1000,
      destinationAddress: destinationAddress as string,
      amountReceived: toncoinAmount.toString(),
      sourceTransaction: {
        type: "TON",
        hash: inTxHash,
        lt: incomingTransaction.lt.toString(),
        memo: extractedPayload.extractedMemo
      }
    }
    saveHistoryEntry(historyEntry);
  }, [incomingTransaction, destinationAddress]);

  useEffect(() => {
    if (!outgoingTransaction || !incomingTransaction || !destinationAddress) return;

    let inTxHash = incomingTransaction.hash().toString("base64");
    let historyEntry = getHistoryEntryById(inTxHash as string);
    if(historyEntry && !historyEntry.destinationTransaction) {
      historyEntry.destinationTransaction = {
        type: "EVM",
        chainId: "",
        txHash: outgoingTransaction
      }
      saveHistoryEntry(historyEntry);
    }

  }, [outgoingTransaction, incomingTransaction, destinationAddress, amount]);



  function getFormattedToncoinAmountReceivedByDestination() {
    if (!incomingTransaction) return undefined;
    return stripDecimals(
      formatUnits(
        (incomingTransaction.inMessage?.info as CommonMessageInfoInternal).value.coins
        - incomingTransaction.totalFees.coins,
        networkConfig.ton.tonDecimals
      )
    );
  }

  return <div>

    <IncomingTONTxInfo destinationAddress={destinationAddress}
      transactionHash={incomingTransaction?.hash().toString("base64")}
      transactionLT={incomingTransaction?.lt}
      amount={getFormattedToncoinAmountReceivedByDestination()}
    />

    <OutgoingEVMTxInfo transactionHash={outgoingTransaction}
      destinationAddress={destinationAddress}
      amount={getFormattedToncoinAmountReceivedByDestination()}
      isActive={incomingTransaction != undefined}
    />

    <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700"
      onClick={() => { onClickBack() }}> Back </button>

  </div >


}

export default TransferInfoTONToBNB;