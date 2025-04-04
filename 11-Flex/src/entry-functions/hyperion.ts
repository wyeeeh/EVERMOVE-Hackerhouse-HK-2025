import { hyperionsdk, wallet} from "@/components/Main";
//@ts-ignore
import { FeeTierIndex, roundTickBySpacing } from "@hyperionxyz/sdk";

import { coin_address, coin_type } from "@/constants";

export async function Hyperion_getPostion() {
  const postion = await hyperionsdk.Position.fetchAllPositionsByAddress({
    address: wallet.account?.address
  })
  return postion
}

export async function Hyperion_getallpool() {
    const poolItems = await hyperionsdk.Pool.fetchAllPools();
    return poolItems
}

export async function Hyperion_getpool(poolid: string) {
    const pool = await hyperionsdk.Pool.fetchPoolById({
        poolId: poolid
    })
    return pool
}

export async function Hyperion_creatposition(currencyAAmount: number, currentPriceTick: number, tickLower: number, tickUpper: number) {
    const feeTierIndex = FeeTierIndex["PER_0.05_SPACING_5"]
    currentPriceTick = roundTickBySpacing(currentPriceTick, feeTierIndex)
    tickLower = roundTickBySpacing(tickLower, feeTierIndex)
    tickUpper = roundTickBySpacing(tickUpper, feeTierIndex)
    const [_, currencyBAmount] = await hyperionsdk.Pool.estCurrencyBAmountFromA({
        currencyA: coin_address.APT,
        currencyB: coin_address.USDC,
        currencyAAmount,
        feeTierIndex,
        tickLower,
        tickUpper,
        currentPriceTick,
      });
    
    console.log(currencyAAmount, currencyBAmount)
    const params = {
        currencyA: coin_type.APT,
        currencyB: coin_type.USDC,
        currencyAAmount,
        currencyBAmount,
        feeTierIndex,
        currentPriceTick,
        tickLower,
        tickUpper,
        slippage: 0.1
    };
    const payload = await hyperionsdk.Pool.createPoolTransactionPayload(params)
    console.log(payload)
    return payload
}

