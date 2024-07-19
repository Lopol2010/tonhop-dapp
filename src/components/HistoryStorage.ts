// src/components/TransferAssets.js

import '../App.css';

export type HistoryEntry = {
  date: EpochTimeStamp,
  bridgeRecievedAmount: string,
  destinationReceivedAmount?: bigint,
  destinationAddress: string,
  bsc: {
    txHash: `0x${string}`,
    status: string,
  },
  ton?: {
    // NOTE: only holds transaction of DESTINATION adress, and not bridge's wallet address
    txHash: string,
    txLt: bigint
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

const HISTORY_STORAGE_KEY = "history";


export function saveHistoryEntry(entry: HistoryEntry) {

  let historyArray = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]") as HistoryEntry[];

  let savedIndex = historyArray.findIndex((e) => e.bsc.txHash == entry.bsc.txHash);
  if(savedIndex != -1) {
      historyArray[savedIndex] = entry;
  } else {
      historyArray.push(entry);
  }

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyArray));
}

export function getHistoryEntryByTxHash(txHash: string) {

  let historyArray = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]") as HistoryEntry[];

  return historyArray.find(entry => entry.bsc.txHash === txHash);

}

export function getAllHistoryEntries() {

  let historyArray = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]") as HistoryEntry[];
  return historyArray;
}