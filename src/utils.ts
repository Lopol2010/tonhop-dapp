import { Address } from "@ton/ton";
import { formatUnits, parseUnits } from "viem";
import { networkConfig } from "./networkConfig";


// export let parseWTON = (amountA: string) => parseUnits(amountA, 9);
export const convertDecimals = (amountA: bigint, decimalsA: number, decimalsB: number) => {
    if (decimalsA > decimalsB) {
        return amountA / (BigInt(10) ** BigInt(decimalsA - decimalsB));
    } else if (decimalsA < decimalsB) {
        return amountA * (BigInt(10) ** BigInt(decimalsB - decimalsA));
    }
    return amountA;
}

// transform bigint into string with 4 decimals
export function stripDecimals(amount: string) {
    return amount.replace(/(\d+)(\.?\d{0,4})\d*/g, "$1$2");
}
export function formatWTON(value: bigint) {
    const formattedAmountString = formatUnits(value, networkConfig.bsc.wtonDecimals);
    return formattedAmountString;
}

export const parseWTON = (amount: string) => parseUnits(amount, networkConfig.bsc.wtonDecimals);

export function isValidTonAddress(address: string) {

    try {
        let { workChain } = Address.parse(address);
        // // discard masterchain 
        // if(workChain != 0) {
        //     return false;
        // }
    } catch (error) {
        return false;
    }

    return true;
}

export function hasTestnetFlag(address: string) {

    if (Address.isFriendly(address)) {
        let { isTestOnly } = Address.parseFriendly(address);
        return isTestOnly;
    }

    return false;
}