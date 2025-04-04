import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export function ExeuteTrade() {
  const [amount, setAmount] = useState<string>("")

  const handleExecute = async () => {
    if (!amount || isNaN(Number(amount))) {
      console.error("请输入有效金额")
      return
    }
    // TODO: 执行交易逻辑
    console.log("执行交易，金额:", amount)
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