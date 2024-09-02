import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { useEffect, useState } from "react";
import { networkConfig } from "../networkConfig";

export function useTonClient() {
    const [state, setState] = useState<TonClient>();
    useEffect(() => {
        (async () => {
            // const endpoint = await getHttpEndpoint({ network: networkConfig.ton.network });
            const endpoint = networkConfig.ton.rpcNodeURL;
            setState(
                new TonClient({ 
                    endpoint: endpoint,
                    apiKey: networkConfig.ton.nodeRpcApiKey
                })
            )
        })()
    }, []);
    return state;
}