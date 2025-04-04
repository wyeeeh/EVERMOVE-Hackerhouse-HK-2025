
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

function divideByPowerOfTen(value: number, exponent: number): number {
    // 将 number 转为字符串，避免精度丢失
    let strValue = value.toString();
  
    // 分离整数和小数部分
    const [integerPart, decimalPart = ""] = strValue.split(".");
  
    // 计算总长度和小数点新位置
    const totalLength = integerPart.length + decimalPart.length;
    const decimalPlaces = decimalPart.length; // 当前小数位数
    const shift = exponent - decimalPlaces; // 需要移动的位数
  
    let resultStr: string;
  
    if (shift >= integerPart.length) {
      // 如果移动位数超过整数部分长度，结果是小数
      const zerosToAdd = shift - integerPart.length;
      resultStr = "0." + "0".repeat(zerosToAdd) + integerPart + decimalPart;
    } else if (shift > 0) {
      // 小数点在整数部分内移动
      const newDecimalPos = integerPart.length - shift;
      resultStr =
        integerPart.slice(0, newDecimalPos) + "." + integerPart.slice(newDecimalPos) + decimalPart;
    } else if (shift === 0) {
      // 移动位数等于当前小数位数，直接拼接
      resultStr = integerPart + "." + decimalPart;
    } else {
      // shift < 0，需要向右移动（相当于乘以 10^|shift|）
      const rightShift = -shift;
      resultStr = (integerPart + decimalPart).padEnd(totalLength + rightShift, "0");
    }
  
    // 移除多余的前导零和小数点后的尾随零
    resultStr = resultStr
      .replace(/^0+(?=\d)/, "") // 移除前导零（但保留 0.xxx 的 0）
      .replace(/\.?0+$/, ""); // 移除尾随零和小数点（如果全是 0）
  
    // 转换为 number 类型返回
    return Number(resultStr);
  }

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
    const borrow_pos = await getUserLoan(userAddress, "APT")
    
    mypositions.push({
        coin: "USDC",
        lend: lend_pos,
        borrow: 0,
    })
    mypositions.push({
        coin: "APT",
        lend: 0,
        borrow: borrow_pos,
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