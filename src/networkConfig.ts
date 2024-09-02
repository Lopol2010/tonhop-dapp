import { Address } from "@ton/ton";
import { Network } from "@orbs-network/ton-access";
import { Chain, bsc, bscTestnet } from "viem/chains";
import { parseWTON } from "./utils/utils";

const configs: { [id: string]: NetworkConfigInterface } = {
    development: {
        wagmiStorageKey: "wagmi-store-dev",
        bridgeFee: "0",
        ton: {
            // TODO: should probably add testnet as option on frontend when NODE_ENV=dev
            network: "testnet",
            // testnet, owner is my keypair
            highloadWalletAddress: Address.parse("0QDzVut2kivyZv6W916A58ilS7AvjtvtuwltVGRqpiWbwgLO"),
            tonDecimals: 9,
            getExplorerLink: (txHash: string) => "https://testnet.tonscan.org/tx/" + txHash,
            nodeRpcApiKey: "3691a429acb06e5966219b55317c14f27766df31ce581af0723c56cf1013da94",
            rpcNodeURL: "https://toncenter.com/api/v2/jsonRPC"

        },
        bnb: {
            chain: bscTestnet,
            wtonDecimals: 18,
            minAmount: "0.05",
            bridgeWalletAddress: "0xdee9245A8A81004A37854D9d99e501F97eB6AE4B",
            wtonAddress: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
            getExplorerLink: (txHash: string) => "https://testnet.bscscan.com/tx/" + txHash
        }
    },
    production: {
        wagmiStorageKey: "wagmi-store-prod",
        bridgeFee: "0",
        ton: {
            network: "mainnet",
            // mainnet, owner is Alex's keypair
            highloadWalletAddress: Address.parse("EQDbm_PjuTsS2eUwaqcESuOqkiTBNIZrB5R12g54lBsQ7S5m"),
            tonDecimals: 9,
            getExplorerLink: (txHash: string) => "https://tonscan.org/tx/" + txHash,
            nodeRpcApiKey: "3691a429acb06e5966219b55317c14f27766df31ce581af0723c56cf1013da94",
            rpcNodeURL: "https://toncenter.com/api/v2/jsonRPC"
        },
        bnb: {
            chain: bsc,
            wtonDecimals: 9,
            minAmount: "0.05",
            bridgeWalletAddress: "0xdee9245A8A81004A37854D9d99e501F97eB6AE4B",
            wtonAddress: "0x76A797A59Ba2C17726896976B7B3747BfD1d220f",
            getExplorerLink: (txHash: string) => "https://bscscan.com/tx/" + txHash
        }
    }
}

export const networkConfig = configs[import.meta.env.MODE];

type NetworkConfigInterface = {
    bridgeFee: string,
    wagmiStorageKey: string,
    ton: {
        network: Network,
        highloadWalletAddress: Address,
        tonDecimals: number,
        getExplorerLink: (txHash: string) => string,
        nodeRpcApiKey: string,
        rpcNodeURL: string
    },
    bnb: {
        chain: Chain,
        wtonDecimals: number,
        minAmount: string,
        bridgeWalletAddress: `0x${string}`,
        wtonAddress: `0x${string}`,
        getExplorerLink: (txHash: string) => string
    }
}