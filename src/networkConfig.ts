import { Address } from "@ton/ton";
import { Network } from "@orbs-network/ton-access";
import { Chain, bsc, bscTestnet } from "viem/chains";

const configs: { [id: string]: NetworkConfigInterface } = {
    development: {
        ton: {
            network: "testnet",
            // testnet, owner is my keypair
            highloadWalletAddress: Address.parse("0QDzVut2kivyZv6W916A58ilS7AvjtvtuwltVGRqpiWbwgLO"),
            tonDecimals: 9
        },
        bsc: {
            chain: bscTestnet,
            wtonDecimals: 18,
            minAmount: "0.05",
        }
    },
    production: {
        ton: {
            network: "mainnet",
            // mainnet, owner is Alex's keypair
            highloadWalletAddress: Address.parse("EQDbm_PjuTsS2eUwaqcESuOqkiTBNIZrB5R12g54lBsQ7S5m"),
            tonDecimals: 9
        },
        bsc: {
            chain: bsc,
            wtonDecimals: 9,
            minAmount: "0.05",
        }
    }
}

export const networkConfig = configs[import.meta.env.MODE];

type NetworkConfigInterface = {
    ton: {
        network: Network,
        highloadWalletAddress: Address,
        tonDecimals: number
    },
    bsc: {
        chain: Chain,
        wtonDecimals: number,
        minAmount: string
    }
}