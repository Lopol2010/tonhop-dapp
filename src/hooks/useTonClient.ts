import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { useEffect, useState } from "react";
import { networkConfig } from "../networkConfig";

export function useTonClient() {
    const [state, setState] = useState<TonClient>();
    useEffect(() => {
        (async () => {
            setState(
                new TonClient({ 
                    endpoint: await getHttpEndpoint({ network: networkConfig.ton.network ? 'testnet' : 'mainnet' }) 
                })
            )
        })()
    }, []);
    return state;
}