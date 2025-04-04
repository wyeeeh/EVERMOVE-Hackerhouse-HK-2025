import { Hyperion_getPostion, Hyperion_getpool } from "@/entry-functions/hyperion";
// @ts-ignore
import { tickToPrice } from "@hyperionxyz/sdk"
import { Hyperion_creatposition } from "@/entry-functions/hyperion";
import { send_entry_tx } from "@/view-functions/Contract_interact";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react"

export const poolid = {
    apt_usdc: "0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8",
    apt_usdt: "0x18269b1090d668fbbc01902fa6a5ac6e75565d61860ddae636ac89741c883cbc",
    usdt_usdc: "0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127",
} as const;

export const poolid2string: Record<string, string> = {
    "0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8" : "APT_USDC",
    "0x18269b1090d668fbbc01902fa6a5ac6e75565d61860ddae636ac89741c883cbc" : "APT_USDT",
    "0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127" : "USDT_USDC",
}

export interface Position {
    pair: string;
    value: number;
    current_price: number;
    upper_price: number;
    lower_price: number;
    estapy: number;
}

async function get_apy(id: string) : Promise<number> {
    const poolinfo = await Hyperion_getpool(id)
    return Number(poolinfo[0].farmAPR) + Number(poolinfo[0].feeAPR)
}


async function get_current_tick(poolinfo: any) {
    return poolinfo[0].pool.currentTick;
}


async function tick2price(poolinfo: any, tick: number) {
    const decimals1 = poolinfo[0].pool.token1Info.decimals
    const decimals2 = poolinfo[0].pool.token2Info.decimals
    const base = 1.0001;
    const price = Math.pow(base, tick);
    const decimalsDiff = decimals1 - decimals2;
    const adjustedPrice = price * Math.pow(10, decimalsDiff);
    return adjustedPrice
}

async function price2tick(poolinfo: any, price: number) {   
    const decimalsDiff = poolinfo[0].pool.token2Info.decimals - poolinfo[0].pool.token1Info.decimals; // 注意顺序：token0 是分母
  const adjustedPrice = price * Math.pow(10, decimalsDiff);
  const base = 1.0001;
  const tick = Math.log(adjustedPrice) / Math.log(base);
  return Math.round(tick);
}

export async function get_hyperion_positions() : Promise<Position[]>{
    const postions = await Hyperion_getPostion()
    const mypositions: Position[] = [];
    
    await Promise.all(
    postions.map(async (item: any) => {
        const id = item.position.poolId
        const poolinfo = await Hyperion_getpool(id)
        //console.log(item.position.pool.currentTick, item.position.tickUpper, item.position.tickLower)
        await tick2price(poolinfo, item.position.pool.currentTick)
        mypositions.push({
          pair: poolid2string[id],
          value: Number(item.value),
          current_price: await tick2price(poolinfo, item.position.pool.currentTick),
            upper_price: await tick2price(poolinfo, item.position.tickUpper),
            lower_price: await tick2price(poolinfo, item.position.tickLower),
            estapy : await get_apy(item.position.poolId),
        });
      }));
    console.log(mypositions)
    return mypositions
}

export async function create_hyperion_positions(amountapt: number, lowerprice: number, upperprice: number) {
    const poolinfo = await Hyperion_getpool(poolid.apt_usdc)
    const currencytick =  await get_current_tick(poolinfo)
    const lower = await price2tick(poolinfo, lowerprice)
    const upper = await price2tick(poolinfo, upperprice)
    console.log(lower, upper)
    //const lower = currencytick - 1000;
    //const upper = currencytick + 1000;
    const params = await Hyperion_creatposition(amountapt, currencytick, lower, upper)
    const transaction : InputTransactionData = {
            data:{
                function: params.function,
                functionArguments: params.functionArguments,
                typeArguments: params.typeArguments
            }
        }
    await send_entry_tx(transaction)
}
