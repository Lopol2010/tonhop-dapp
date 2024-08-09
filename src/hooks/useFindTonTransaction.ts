import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, CommonMessageInfo, CommonMessageInfoInternal, Transaction } from "@ton/core";
import { TonClient } from "@ton/ton";
import { useEffect, useState } from "react";
import { networkConfig } from "../networkConfig";
import { TONWatcher } from "../utils/TONWatcher";
import { useTonClient } from "./useTonClient";
import { isAddress } from "viem";
import { isValidTonAddress } from "../utils/utils";

export default function useFindTonTransaction(
  addressToSearchAt: string | undefined,
  predicate: (transaction: Transaction) => boolean
) {

  type TransactionWithSourceAddress = Transaction & {
    inMessage: CommonMessageInfoInternal & {
      info: CommonMessageInfo & {
        src: Address
      }
    }
  }

  const [transaction, setTransaction] = useState<Transaction>();
  const client = useTonClient();
  const [tonWatcher, setTonWatcher] = useState<TONWatcher>();

  useEffect(() => {
    if (!client || !addressToSearchAt || !isValidTonAddress(addressToSearchAt)) return;

    if (!tonWatcher) {
      console.log("creating TONWatcher");
      const _tonWatcher = new TONWatcher({
        client,
        accountAddress: Address.parse(addressToSearchAt),
        startTransactionLT: undefined,
        startTransactionHash: undefined,
        startTimestamp: Date.now() / 1000 - 50,
        onNewStartTransaction: async (lt, hash) => { },
        predicate,
        onTransaction: async tx => {
          if (predicate(tx)) {
            setTransaction(tx);
          }
        }
      });
      setTonWatcher(_tonWatcher);
    }
    console.log("TONWatcher start");
    tonWatcher?.start();

    return () => tonWatcher?.stop();

  }, [client, addressToSearchAt]);

  return transaction;
}