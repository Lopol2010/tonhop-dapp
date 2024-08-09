import { useWatchContractEvent } from "wagmi";
import { networkConfig } from "../networkConfig";
import { erc20Abi } from "viem";
import { useEffect, useState } from "react";

export default function useWaitForTransferEvent(
    destinationAddress: `0x${string}` | undefined,
    shouldSearchForOutTransaction: boolean,
) {

    let [transferData, setTransferData] = useState<{hash?: `0x${string}`, amount?: bigint}>({});

    // TODO: might need to add effect that'll clear data when input args change
    
    useWatchContractEvent({
        address: networkConfig.bnb.bridgeWalletAddress,
        abi: erc20Abi,
        eventName: "Transfer",
        onLogs: (logs) => {
            logs.forEach(log => {
                if(!shouldSearchForOutTransaction || log.removed || !log.args.value || !log.transactionHash) return;

                if(!transferData.hash && log.args.to?.toLowerCase() == destinationAddress?.toLowerCase()) {
                    setTransferData({ hash: log.transactionHash, amount: log.args.value });
                }
            })
        }
    })
    return transferData;
}