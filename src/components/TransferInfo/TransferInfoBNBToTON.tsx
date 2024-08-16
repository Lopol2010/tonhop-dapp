import { useCallback, useEffect } from 'react';
import { formatUnits } from 'viem';
import { networkConfig } from '../../networkConfig';
import { stripDecimals } from '../../utils/utils';
import { QueryStatus } from '@tanstack/react-query';
import { Address, CommonMessageInfoInternal, Transaction } from '@ton/ton';
import { CrosschainTransfer, getHistoryEntryById, saveHistoryEntry } from '../HistoryStorage';
import { ChainName } from '../../types/ChainName';
import useFindTonTransaction from '../../hooks/useFindTonTransaction';
import IncomingEVMTxInfo from './IncomingEVMTxInfo';
import OutgoingTONTxInfo from './OutgoingTONTxInfo';

interface TransferInfoBNBToTONProps {
  destinationAddress: string | undefined,
  amount: string | undefined,
  transactionStatus: QueryStatus,
  transactionHash: `0x${string}` | undefined,
  transferStartTimestamp: EpochTimeStamp,
  onClickBack: () => void
}

const TransferInfoBNBToTON: React.FC<TransferInfoBNBToTONProps> = ({ transferStartTimestamp, destinationAddress, transactionStatus, transactionHash, amount, onClickBack }) => {

  function extractPayload(tx: Transaction) {
    if (!tx.inMessage) return null;
    let payloadString;
    let extractedTxHash;
    try {
      payloadString = tx.inMessage.body.beginParse().loadStringTail();
      if (tx.inMessage.body.beginParse().remainingRefs == 1) {
        payloadString += tx.inMessage.body.beginParse().loadStringRefTail();
      }
      // remove 4 bytes of zeroes
      payloadString = payloadString.trim().slice(4);
      extractedTxHash = payloadString.slice(66, 132);
    } catch (error) {
      console.log("error parsing payload:", error);
      return null;
    }
    return { BNBTxHash: extractedTxHash }
  }

  const destinationTx = useFindTonTransaction(
    destinationAddress,
    transferStartTimestamp,
    useCallback((tx) => {
      if (!destinationAddress || !tx.inMessage?.info.src || !tx.inMessage.info.dest
        || !(tx.inMessage.info.src as Address).equals(networkConfig.ton.highloadWalletAddress)
        || !(tx.inMessage.info.dest as Address).equals(Address.parse(destinationAddress))) {
        return false;
      }

      let data = extractPayload(tx);

      if (data?.BNBTxHash != transactionHash) return false;

      return true;
    }, [destinationAddress, transactionHash])
  );

  useEffect(() => {
    if (!transactionHash || !destinationAddress) return;

    let isAlreadyStored = getHistoryEntryById(transactionHash as string) !== undefined;
    if(isAlreadyStored) return;

    let historyEntry: CrosschainTransfer = {
      id: transactionHash,
      createdAt: Date.now() / 1000,
      destinationAddress: destinationAddress,
      sourceTransaction: {
        type: "EVM",
        chainId: "",
        txHash: transactionHash
      }
    }

    saveHistoryEntry(historyEntry);
  }, [transactionHash, destinationAddress, amount]);

  useEffect(() => {
    if (!destinationTx || !transactionHash) return;

    let historyEntry = getHistoryEntryById(transactionHash as string);
    let extractedPayload = extractPayload(destinationTx);
    if (historyEntry && !historyEntry.destinationTransaction && destinationTx.inMessage && extractedPayload) {
      let toncoinAmount = (destinationTx.inMessage.info as CommonMessageInfoInternal).value.coins;
      historyEntry.amountReceived = toncoinAmount.toString();
      historyEntry.destinationTransaction = {
        type: "TON",
        hash: destinationTx.hash().toString("base64"),
        lt: destinationTx.lt.toString(),
        memo: ""
      }
      saveHistoryEntry(historyEntry);
    }
  }, [destinationTx, transactionHash]);



  function getFormattedToncoinAmountReceivedByDestination() {
    if (!destinationTx) return undefined;
    return stripDecimals(
      formatUnits(
        (destinationTx.inMessage?.info as CommonMessageInfoInternal).value.coins,
        networkConfig.ton.tonDecimals
      )
    );
  }

  return <div>
    <IncomingEVMTxInfo transactionHash={transactionHash}
      transactionStatus={transactionStatus}
      destinationAddress={destinationAddress || ""}
      amount={amount}
    />

    <OutgoingTONTxInfo destinationAddress={destinationAddress}
      transactionHash={destinationTx?.hash().toString("base64")}
      transactionLT={destinationTx?.lt}
      amount={getFormattedToncoinAmountReceivedByDestination()}
      isActive={transactionStatus == "success"}
    />
    <button className="w-[calc(100%-40px)] m-5 px-5 py-2 text-gray border border-solid border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700"
      onClick={() => { onClickBack() }}> Back </button>
  </div >


}

export default TransferInfoBNBToTON;