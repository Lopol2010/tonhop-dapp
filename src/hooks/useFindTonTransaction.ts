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
  startTimestamp: number,
  predicate: (transaction: Transaction) => boolean
) {

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [tonWatcher, setTonWatcher] = useState<TONWatcher | null>(null);
  const client = useTonClient();

  useEffect(() => {
    if (!client || !addressToSearchAt || !isValidTonAddress(addressToSearchAt)) return;

    const _tonWatcher = new TONWatcher({
      client,
      accountAddress: Address.parse(addressToSearchAt),
      startTransactionLT: undefined,
      startTransactionHash: undefined,
      startTimestamp: startTimestamp,
      onNewStartTransaction: async (lt, hash) => { },
      onTransaction: async tx => {
        if (predicate(tx)) {
          // console.log((tx.inMessage?.info as CommonMessageInfoInternal).value.coins, tx.totalFees, tx.description);
          setTransaction(tx);
          
          _tonWatcher.stop();
        }
      }
    });
    _tonWatcher.start();
    setTonWatcher(_tonWatcher);

    return () => _tonWatcher.stop();

  }, [client, addressToSearchAt, predicate]);

  return transaction;
}