import { hyperionsdk, wallet} from "@/components/Main";


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

