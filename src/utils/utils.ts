import { Address } from "@ton/ton";
import { formatUnits, parseUnits } from "viem";
import { networkConfig } from "../networkConfig";


// export let parseWTON = (amountA: string) => parseUnits(amountA, 9);
export const convertDecimals = (amountA: bigint, decimalsA: number, decimalsB: number) => {
    if (decimalsA > decimalsB) {
        return amountA / (BigInt(10) ** BigInt(decimalsA - decimalsB));
    } else if (decimalsA < decimalsB) {
        return amountA * (BigInt(10) ** BigInt(decimalsB - decimalsA));
    }
    return amountA;
}

// limit float to 4 decimals
export function stripDecimals(amount: string) {
    return amount.replace(/(\d+)(\.?\d{0,4})\d*/g, "$1$2");
}
export function formatWTON(value: bigint) {
    const formattedAmountString = formatUnits(value, networkConfig.bnb.wtonDecimals);
    return formattedAmountString;
}
export function formatTON(value: bigint) {
    const formattedAmountString = formatUnits(value, networkConfig.ton.tonDecimals);
    return formattedAmountString;
}

export function calcReceiveAmount(inputAmountBNB: string) {
    console.log(inputAmountBNB)
    return parseWTON(inputAmountBNB) 
        - convertDecimals(
            parseTON("0.06") + parseTON(networkConfig.bridgeFee),
            networkConfig.ton.tonDecimals,
            networkConfig.bnb.wtonDecimals
        )
}


export const parseWTON = (amount: string) => parseUnits(amount, networkConfig.bnb.wtonDecimals);
export const parseTON = (amount: string) => parseUnits(amount, networkConfig.ton.tonDecimals);

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