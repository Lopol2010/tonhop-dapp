// export type HistoryEntry = {
//   date: EpochTimeStamp,
//   amount: string,
//   destinationAddress: string | `0x${string}`,
//   // TODO: these maybe need refactor
//   bnb?: {
//     txHash: `0x${string}`,
//     status: string,
//   },
//   ton?: {
//     // NOTE: only holds input tx of destination adress
//     txHash: string,
//     txLt: bigint
//   }

// }
export interface CrosschainTransfer {
  id: string;
  // status: 'pending' | 'completed' | 'failed';
  createdAt: EpochTimeStamp;
  // updatedAt: string;
  destinationAddress: string;
  amountReceived?: string;
  sourceTransaction: TONTransaction | EVMTransaction;
  destinationTransaction?: TONTransaction | EVMTransaction;
}

interface TONTransaction {
  type: "TON";
  lt: string;
  hash: string;
  memo: string;
}

interface EVMTransaction {
  type: "EVM";
  chainId: string;
  txHash: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

const HISTORY_STORAGE_KEY = "history";


export function saveHistoryEntry(entry: CrosschainTransfer) {

  let historyArray = getAllHistoryEntries();

  let storedAtIndex = historyArray.findIndex((e) => e.id === entry.id);
  if(storedAtIndex == -1) {
      historyArray.push(entry);
  } else {
      historyArray[storedAtIndex] = entry;
  }

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyArray));
}

export function getHistoryEntryById(id: string) {
  let historyArray = getAllHistoryEntries();
  return historyArray.find(entry => entry.id === id);
}

// export function getNextHistoryEntryId() {
//   let historyArray = getAllHistoryEntries();
//   return historyArray.length.toString();
// }

// export function getCurrentHistoryEntryId() {
//   let historyArray = getAllHistoryEntries();
//   return (historyArray.length - 1).toString();
// }

export function getAllHistoryEntries() {

  let historyArray = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]") as CrosschainTransfer[];
  return historyArray;
}