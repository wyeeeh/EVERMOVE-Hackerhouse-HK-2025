
import { aptos, getWalletAddress} from "@/components/Main";
import { AccountAddress, MoveStructId, convertAmountFromOnChainToHumanReadable} from "@aptos-labs/ts-sdk"
import {view_addr, entry_addr, send_view_tx, send_entry_tx} from "@/view-functions/Contract_interact"
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react"

export interface Position {
    coin: string;
    lend: number;
    borrow: number;
}

export const Aries_address: Record<string, string> = {
    "USDC" : "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::wrapped_coins::WrappedUSDC",
    "APT" : "0x1::aptos_coin::AptosCoin",
} as const;

export const Aries_decimal: Record<string, number> = {
    "USDC" : 6,
    "APT" :  26,
} as const;

export async function getUserDeposit(userAddress: AccountAddress | string, token: string): Promise<any> {
	const payload = {
        function: view_addr.Aries_getUser_deposit,
        functionArguments: [userAddress.toString(), 'Main Account'],
        typeArguments: [Aries_address[token]],
    }
    const result = await send_view_tx(payload)
    console.log(result)
    return Number (result[1]) / Math.pow(10, Aries_decimal[token])
}

export async function getUserLoan(userAddress: AccountAddress | string, token: string): Promise<any> {
	const payload = {
        function: view_addr.Aries_getUser_loan,
        functionArguments: [userAddress.toString(), 'Main Account'],
        typeArguments: [Aries_address[token]],
    }
    const result = await send_view_tx(payload)
    console.log(result)
    return Number (result[1]) / Math.pow(10, Aries_decimal[token])
    //return Number (result[1]) / Aries_decimal[token]
}

export async function getAllPostion(userAddress: AccountAddress | string): Promise<Position[]> {
    const mypositions: Position[] = [];
    const lend_pos = await getUserDeposit(userAddress, "USDC")
    const borrow_pos = await getUserDeposit(userAddress, "APT")
    
    mypositions.push({
        coin: "USDC",
        lend: lend_pos,
        borrow: 0,
    })
    mypositions.push({
        coin: "APT",
        lend: borrow_pos,
        borrow: 0,
    })
    return mypositions
}

export async function Aries_lendToken(amount : number, token : string) {
    const transaction : InputTransactionData = {
            data:{
                function: entry_addr.Aries_lend,
                functionArguments: ["Main Account", amount],
                typeArguments: [Aries_address[token]]
            }
        }
    const signedTransaction = await send_entry_tx(transaction)
}

export async function Aries_borrowToken(amount : number, token : string) {
    const transaction : InputTransactionData = {
            data:{
                function: entry_addr.Aries_borrow,
                functionArguments: ["Main Account", amount, true],
                typeArguments: [Aries_address[token]]
            }
        }
    const signedTransaction = await send_entry_tx(transaction)
}