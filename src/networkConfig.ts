import { Address } from "@ton/ton";
import { Network } from "@orbs-network/ton-access";
import { Chain, bsc, bscTestnet } from "viem/chains";
import { parseWTON } from "./utils";

const configs: { [id: string]: NetworkConfigInterface } = {
    development: {
        bridgeFee: "0",
        ton: {
            // TODO: should probably add testnet as option on frontend when NODE_ENV=dev
            network: "testnet",
            // testnet, owner is my keypair
            highloadWalletAddress: Address.parse("0QDzVut2kivyZv6W916A58ilS7AvjtvtuwltVGRqpiWbwgLO"),
            tonDecimals: 9,
            getExplorerLink: (txHash: string) => "https://testnet.tonscan.org/tx/" + txHash
        },
        bsc: {
            chain: bscTestnet,
            wtonDecimals: 18,
            minAmount: "0.05",
            getExplorerLink: (txHash: string) => "https://testnet.bscscan.com/tx/" + txHash
        }
    },
    production: {
        bridgeFee: "0",
        ton: {
            network: "mainnet",
            // mainnet, owner is Alex's keypair
            highloadWalletAddress: Address.parse("EQDbm_PjuTsS2eUwaqcESuOqkiTBNIZrB5R12g54lBsQ7S5m"),
            tonDecimals: 9,
            getExplorerLink: (txHash: string) => "https://tonscan.org/tx/" + txHash
        },
        bsc: {
            chain: bsc,
            wtonDecimals: 9,
            minAmount: "0.05",
            getExplorerLink: (txHash: string) => "https://bscscan.com/tx/" + txHash
        }
    }
}

export const networkConfig = configs[import.meta.env.MODE];

type NetworkConfigInterface = {
    bridgeFee: string,
    ton: {
        network: Network,
        highloadWalletAddress: Address,
        tonDecimals: number,
        getExplorerLink: (txHash: string) => string
    },
    bsc: {
        chain: Chain,
        wtonDecimals: number,
        minAmount: string,
        getExplorerLink: (txHash: string) => string
    }
}