import { useEffect } from 'react';
import { formatUnits } from 'viem';
import { networkConfig } from '../../networkConfig';
import { stripDecimals } from '../../utils/utils';
import { QueryStatus } from '@tanstack/react-query';
import { Address, CommonMessageInfoInternal } from '@ton/ton';
import { getHistoryEntryByTxHash, saveHistoryEntry } from '../HistoryStorage';
import { ChainName } from '../../types/ChainName';
import useFindTonTransaction from '../../hooks/useFindTonTransaction';
import IncomingEVMTxInfo from './IncomingEVMTxInfo';
import OutgoingTONTxInfo from './OutgoingTONTxInfo';

interface TransferInfoBNBToTONProps {
  destinationAddress: string | undefined,
  amount: string | undefined,
  transactionStatus: QueryStatus,
  transactionHash: `0x${string}` | undefined,
  onClickBack: () => void
}

const TransferInfoBNBToTON: React.FC<TransferInfoBNBToTONProps> = ({ destinationAddress, transactionStatus, transactionHash, amount, onClickBack }) => {
  const destinationTx = useFindTonTransaction(
    destinationAddress,
    (tx) => {
      if (!destinationAddress || !tx.inMessage?.info.src || !tx.inMessage.info.dest
        || !(tx.inMessage.info.src as Address).equals(networkConfig.ton.highloadWalletAddress)
        || !(tx.inMessage.info.dest as Address).equals(Address.parse(destinationAddress))) {
        return false;
      }

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
        return false;
      }

      if (extractedTxHash != transactionHash) return false;

      return true;
    }
  );

  // TODO: save history entry
  // useEffect(() => {
  //   if (!destinationTx) return;

  //   let historyEntry = getHistoryEntryByTxHash(transactionHash as string);
  //   if (historyEntry && !historyEntry.ton) {
  //     let toncoinAmount = (destinationTx.inMessage.info as CommonMessageInfoInternal).value.coins;
  //     // historyEntry.destinationReceivedAmount = toncoinAmount;
  //     historyEntry.ton = {
  //       txHash: destinationTx.hash().toString("hex"),
  //       txLt: destinationTx.lt
  //     }
  //     saveHistoryEntry(historyEntry);
  //   }
  // }, [destinationTx]);

  function formatTxHexHash(hash: string) {
    return hash.replace(/^(\w{6})\w+(\w{5})$/g, "$1...$2");
  }

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