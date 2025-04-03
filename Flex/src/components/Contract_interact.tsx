import type {InputViewFunctionData, CommittedTransactionResponse} from "@aptos-labs/ts-sdk"

import { aptos, wallet} from "@/components/Main";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react"

export const entry_addr = {
    Joule_lend : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::lend",
    Joule_lend_fa : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::lend_fa",
    Joule_borrow : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::borrow",
    Joule_borrow_fa : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::borrow_fa",
    Joule_withdraw : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::withdraw",
    Joule_withdraw_fa : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::withdraw_fa",
    Joule_repay : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::repay",
    Joule_repay_fa : "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::repay_fa",
} as const;

export const view_addr = {
    Joule_getUserAllPositions: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::user_positions_map",
    Joule_Amount2Shares: '0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::coins_to_shares'
} as const;


export async function send_view_tx(data: InputViewFunctionData) {
    try {
        const transaction = await aptos.view({
            payload: data
        })

        if (!transaction) {
            throw new Error(`Failed to run view function ${data.function}`)
        }
        return transaction
    } catch (error: any) {
        throw new Error(`Error: ${error.message}`)
    }
}

export async function send_entry_tx(data: InputTransactionData) : Promise<CommittedTransactionResponse> {
    try{
        const committedTransaction = await wallet.signAndSubmitTransaction(data);
        const signedTransaction = await aptos.waitForTransaction({transactionHash: committedTransaction.hash});
        if (!signedTransaction.success) {
            throw new Error(`Failed to run entry function ${data.data}`)
        }
        return signedTransaction

    } catch (error: any) {
        throw new Error(`Error: ${error.message}`)
    }   
}