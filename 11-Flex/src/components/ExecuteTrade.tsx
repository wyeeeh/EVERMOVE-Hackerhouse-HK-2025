import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Joule_borrowToken, Joule_lendToken } from "@/utils/JouleUtil"
import { Aries_borrowToken, Aries_lendToken } from "@/utils/AriesUtil"
import { coin_address_map, coin_is_fungible } from "@/constants"
import { getaptprice } from "@/utils/HyperionUtil"
interface TradeStrategy {
  expected_return: number
  risk_index: number
  platforms: {
    Joule?: {
      positions: Array<{
        asset: string
        action: string
        allocation: string
        rationale: string
      }>
    }
    Aries?: {
      positions: Array<{
        asset: string
        action: string
        allocation: string
        rationale: string
      }>
    }
    Hyperion?: {
      positions: Array<{
        asset: string
        action: string
        allocation: string
        fee_tier?: number
        price_range?: {
          lower: number
          upper: number
        }
        rationale: string
      }>
    }
  }
}

function allocation_num(x : string) {
  return parseFloat(x.replace("%", "")) / 100
}

export function ExeuteTrade() {
  const [amount, setAmount] = useState<string>("")
  
  const handleExecute = async () => {
    if (!amount || isNaN(Number(amount))) {
      console.error("请输入有效金额")
      return
    }
    // TODO: 执行交易逻辑
    console.log("执行交易，金额:", amount)
    try {
        const strategy : TradeStrategy = getstrategy();
        //Lend Joule:
        const aptprice = await getaptprice();
        const pos1 = strategy.platforms?.Joule?.positions[0]!;
        const amount1 = allocation_num(pos1?.allocation)
        await Joule_lendToken(amount1, coin_address_map[pos1.asset], '2', false, coin_is_fungible[pos1.asset])
        //Borrow Joule: 
        await Joule_borrowToken(amount1 / aptprice * 0.7, coin_address_map["APT"], "2", true)
        //Lend Aries:
        const pos2 = strategy.platforms?.Aries?.positions[0]!;
        const amount2 = allocation_num(pos2?.allocation)
        await Aries_lendToken(amount2, pos2.asset)
        //Borrow Aries:
        await Aries_borrowToken(amount2 / aptprice * 0.7, "APT")

    } catch (error) {
        console.error(error);
    }
        
  }

  return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="输入金额 USDC"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={handleExecute}>
            执行
          </Button>
        </div>
  )
}