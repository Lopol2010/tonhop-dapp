import { Address, TonClient, Transaction } from '@ton/ton';
import axios from 'axios';
import { getHttpEndpoint } from '@orbs-network/ton-access';

const wait = (millis: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, millis);
    });
}

interface TONWatcherOptions {
    client: TonClient;
    accountAddress: Address;
    startTransactionLT: string | undefined
    startTransactionHash: string | undefined;
    pollInterval?: number;
    startTimestamp?: number;
    onNewStartTransaction: (lt: string, hash: string) => Promise<void>;
    onTransaction: (tx: Transaction) => Promise<void>
}

export class TONWatcher {

    client: TonClient;
    accountAddress: Address;
    startTransactionLT: string | undefined
    startTransactionHash: string | undefined;
    pollInterval: number;
    startTimestamp: number;
    intervalId?: NodeJS.Timeout;
    onNewStartTransaction: (lt: string, hash: string) => Promise<void>;
    onTransaction: (tx: Transaction) => Promise<void>;

    public constructor(options: TONWatcherOptions) {
        this.client = options.client;
        this.accountAddress = options.accountAddress;
        this.startTransactionLT = options.startTransactionLT;
        this.startTransactionHash = options.startTransactionHash;
        this.pollInterval = options.pollInterval || 5 * 1000;
        this.startTimestamp = options.startTimestamp || 0;
        this.onNewStartTransaction = options.onNewStartTransaction;
        this.onTransaction = options.onTransaction;
    }

    start() {
        if(this.intervalId) {
            console.log(`[TONWatcher] ERROR: start failed, already watching!`);
            return;
        }
        console.log(`[TONWatcher] Watching for new transactions at: ${this.accountAddress}`);

        const getTransactions = async (
            retryCount: number = 0,
            newStartTransaction: Transaction | null = null,
            offsetTransactionLT?: string,
            offsetTransactionHash?: string,
        ): Promise<Transaction | null> => {

            if(!this.intervalId) return newStartTransaction;

            const COUNT = 10;


            if (offsetTransactionLT) {
                // console.log(`[TONWatcher] Get ${COUNT} transactions before transaction ${offsetTransactionLT}:${offsetTransactionHash}`);
            } else {
                // console.log(`[TONWatcher] Get last ${COUNT} transactions`);
            }

            if (this.startTransactionLT) {
                // console.log(`[TONWatcher] But newer than transaction ${this.startTransactionLT}:${this.startTransactionHash}`);
            }

            let transactions;

            try {
                transactions = await this.client.getTransactions(this.accountAddress, {
                    limit: 10,
                    ...(offsetTransactionLT != undefined && { lt: offsetTransactionLT }),
                    ...(offsetTransactionHash != undefined && { hash: offsetTransactionHash }),
                    ...(this.startTransactionLT != undefined && { to_lt: this.startTransactionLT.toString() }),
                    archival: true
                });
            } catch (error) {
                let newError = error;
                if (error instanceof axios.AxiosError && error.response) {
                    newError = {
                        status: error.response.status,
                        statusText: error.response.statusText,
                        data: error.response.data
                    };
                }
                console.log("[TONWatcher] error:", error);

                // if an API error occurs, try again
                retryCount++;
                if (retryCount < 10) {
                    await wait(retryCount * 1000);
                    return getTransactions(retryCount, newStartTransaction, offsetTransactionLT, offsetTransactionHash);
                } else {
                    return null;
                }
            }

            console.log(`[TONWatcher] Got ${transactions.length} transactions`);

            if (!transactions.length) {
                return newStartTransaction;
            }

            if (newStartTransaction == null) {
                newStartTransaction = transactions[0];
            }

            for (const tx of transactions) {
                console.log(`[TONWatcher] Got new transaction ${tx.lt} : ${tx.hash().toString("base64")}`);
                if(tx.now <= this.startTimestamp) {
                    return newStartTransaction;
                }

                await this.onTransaction(tx);
            }

            if (transactions.length === 1) {
                return newStartTransaction;
            }

            const lastTx = transactions[transactions.length - 1];
            return await getTransactions(0, newStartTransaction, lastTx.lt.toString(), lastTx.hash().toString('base64'));
        }


        let isProcessing = false;

        const tick = async () => {
            if (isProcessing) return;
            isProcessing = true;

            try {
                const result = await getTransactions(0, null, undefined, undefined);
                if (result != null) {
                    this.startTimestamp = result.now;
                    this.startTransactionLT = result.lt.toString();
                    this.startTransactionHash = result.hash().toString("base64");
                    await this.onNewStartTransaction(this.startTransactionLT, this.startTransactionHash);
                }

            } catch (e) {
                console.error("[TONWatcher]", e);
            }

            isProcessing = false;
        }

        this.intervalId = setInterval(tick, this.pollInterval);
        tick();
    }

    public stop() {
        if(this.intervalId) clearInterval(this.intervalId);
        this.intervalId = undefined;
        console.log("[TONWatcher] Stop watching");
    }

}
