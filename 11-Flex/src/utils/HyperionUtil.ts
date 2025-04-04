import { Hyperion_getPostion, Hyperion_getpool } from "@/entry-functions/hyperion";
// @ts-ignore
import { tickToPrice } from "@hyperionxyz/sdk"
import { Token as UniswapToken } from "@uniswap/sdk-core";
import { AccountAddress } from "@aptos-labs/ts-sdk";

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

interface Position {
    pair: string;
    value: number;
    current_price: number;
    upper_price: number;
    lower_price: number;
    estapy: number;
}

async function get_apy(id: string) : Promise<number> {
    const poolinfo = await Hyperion_getpool(id)
    return poolinfo[0].farmAPR + poolinfo[0].feeAPR
}


async function tick2price(id: string, tick: number) {
    const poolinfo = await Hyperion_getpool(id)
    const decimals1 = poolinfo[0].pool.token1Info.decimals
    const decimals2 = poolinfo[0].pool.token2Info.decimals
    const base = 1.0001;
    const price = Math.pow(base, tick);
    const decimalsDiff = decimals1 - decimals2;
    const adjustedPrice = price * Math.pow(10, decimalsDiff);
    return adjustedPrice
}

export async function get_hyperion_positions() {
    const postions = await Hyperion_getPostion()
    const mypositions: Position[] = [];
    
    postions.forEach(async (item: any) =>{ 
        const id = item.position.poolId
        await tick2price(id, item.position.pool.currentTick)
        mypositions.push({
          pair: poolid2string[id],
          value: item.value,
          current_price: await tick2price(id, item.position.pool.currentTick),
            upper_price: await tick2price(id, item.position.tickUpper),
            lower_price: await tick2price(id, item.position.tickLower),
            estapy : await get_apy(item.position.poolId),
        });
      });
    console.log(mypositions)
    return mypositions
}
