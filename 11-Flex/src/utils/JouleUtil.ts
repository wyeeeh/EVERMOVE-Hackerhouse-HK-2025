

import { aptos, getWalletAddress} from "@/components/Main";
import { AccountAddress, MoveStructId, convertAmountFromOnChainToHumanReadable} from "@aptos-labs/ts-sdk"
import {view_addr, entry_addr, send_view_tx, send_entry_tx} from "@/view-functions/Contract_interact"
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react"
import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js"

export const priceFeed = [
	"0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
	"0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
	"0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5",
	"0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6",
	"0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33",
	"0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
]

async function getPythData() {
    const connection = new AptosPriceServiceConnection("https://hermes.pyth.network")

    return await connection.getPriceFeedsUpdateData(priceFeed)
}

const removeLastInterestRateIndex = (obj: any): any => {
	if (!obj || typeof obj !== "object") {
		return obj
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => removeLastInterestRateIndex(item))
	}

	return Object.entries(obj).reduce((acc: { [key: string]: any }, [key, value]) => {
		if (key === "last_interest_rate_index") {
			return acc
		}

		acc[key] = removeLastInterestRateIndex(value)
		return acc
	}, {})
}

export async function getUserAllPositions(userAddress: AccountAddress | string): Promise<any> {
	const payload = {
    function: view_addr.Joule_getUserAllPositions,
    functionArguments: [userAddress.toString()],
  }
  const transaction = await send_view_tx(payload)
	const cleanedTransaction = removeLastInterestRateIndex(transaction)
	return cleanedTransaction
}

export async function getBalance(mint?: string | MoveStructId): Promise<number> {
	try {
		if (mint) {
			let balance: number
			if (mint.split("::").length !== 3) {
				const balances = await aptos.getCurrentFungibleAssetBalances({
					options: {
						where: {
							owner_address: {
								_eq: getWalletAddress().toStringLong(),
							},
							asset_type: { _eq: mint },
						},
					},
				})

				balance = balances[0].amount ?? 0
			} else {
				balance = await aptos.getAccountCoinAmount({
					accountAddress: getWalletAddress(),
					coinType: mint as MoveStructId,
				})
			}
			return balance
		}
		const balance = await aptos.getAccountAPTAmount({
			accountAddress: getWalletAddress(),
		})

		const convertedBalance = convertAmountFromOnChainToHumanReadable(balance, 8)

		return convertedBalance
	} catch (error: any) {
		throw new Error(`Token transfer failed: ${error.message}`)
	}
}

// transit amount to the shares
export async function Amount2Shares(amount: number, token: string) {
    const payload = {
    function: view_addr.Joule_Amount2Shares,
            functionArguments: [token, amount],
    }
    
    const transaction = await send_view_tx(payload)
    return Number(transaction[0])
}


export async function Joule_lendToken(amount: number,
	mint: MoveStructId | string,
	positionId: string,
	newPosition: boolean,
	fungibleAsset: boolean
): Promise<{ hash: string; positionId: string }> {
    const transaction : InputTransactionData = {
		data:{
			function: fungibleAsset ? entry_addr.Joule_lend_fa : entry_addr.Joule_lend,
        	functionArguments: fungibleAsset ? [positionId, mint.toString(), newPosition, amount]: [positionId, amount, newPosition],
            typeArguments: fungibleAsset ? [] : [mint.toString()]
		}
	}
    const signedTransaction = await send_entry_tx(transaction)
    return {
        hash: signedTransaction.hash,
        // @ts-ignore
        positionId: signedTransaction.events[0].data.position_id,
    }
}

export async function Joule_borrowToken(amount: number,
	mint: MoveStructId | string,
	positionId: string,
	fungibleAsset: boolean
): Promise<{ hash: string; positionId: string }> {
    const pyth_update_data = await getPythData()

    const transaction : InputTransactionData = {
		data:{
			function: fungibleAsset ? entry_addr.Joule_borrow_fa : entry_addr.Joule_borrow,
        	functionArguments: fungibleAsset ? [positionId, mint.toString(), amount, pyth_update_data]: [positionId, amount, pyth_update_data],
            typeArguments: fungibleAsset ? [] : [mint.toString()]
		}
	}
    const signedTransaction = await send_entry_tx(transaction)
    return {
        hash: signedTransaction.hash,
        // @ts-ignore
        positionId: signedTransaction.events[0].data.position_id,
    }
}

export async function Joule_withdrawToken(amount: number,
	mint: MoveStructId | string,
	positionId: string,
	fungibleAsset: boolean
): Promise<{ hash: string; positionId: string }> {
    const pyth_update_data = await getPythData()

    const transaction : InputTransactionData = {
		data:{
			function: fungibleAsset ? entry_addr.Joule_withdraw_fa : entry_addr.Joule_withdraw,
        	functionArguments: fungibleAsset ? [positionId, mint.toString(), amount, pyth_update_data]: [positionId, amount, pyth_update_data],
            typeArguments: fungibleAsset ? [] : [mint.toString()]
		}
	}
    const signedTransaction = await send_entry_tx(transaction)
    return {
        hash: signedTransaction.hash,
        // @ts-ignore
        positionId: signedTransaction.events[0].data.position_id,
    }
}

export async function Joule_repayToken(amount: number,
	mint: MoveStructId | string,
	positionId: string,
	fungibleAsset: boolean
): Promise<{ hash: string; positionId: string }> {

    const transaction : InputTransactionData = {
		data:{
			function: fungibleAsset ? entry_addr.Joule_repay_fa : entry_addr.Joule_repay,
        	functionArguments: fungibleAsset ? [positionId, mint.toString(), amount]: [positionId, amount],
            typeArguments: fungibleAsset ? [] : [mint.toString()]
		}
	}
    const signedTransaction = await send_entry_tx(transaction)
    return {
        hash: signedTransaction.hash,
        // @ts-ignore
        positionId: signedTransaction.events[0].data.position_id,
    }
}