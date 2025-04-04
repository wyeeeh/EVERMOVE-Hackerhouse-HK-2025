import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Joule_borrowToken, Joule_lendToken } from "@/utils/JouleUtil"
import { Aries_borrowToken, Aries_lendToken } from "@/utils/AriesUtil"
import { coin_address_map, coin_is_fungible } from "@/constants"
import { getaptprice } from "@/utils/HyperionUtil"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlatformPosition {
  asset: string;
  action: string;
  allocation: string;
  rationale: string;
  fee_tier?: number;
  price_range?: {
    lower: number;
    upper: number;
  };
}

interface TradeStrategy {
  expected_return: number;
  risk_index: number;
  platforms: {
    Joule?: {
      positions: PlatformPosition[];
    };
    Aries?: {
      positions: PlatformPosition[];
    };
    Hyperion?: {
      positions: PlatformPosition[];
    };
  };
}

interface AllStrategies {
  "14days"?: TradeStrategy;
  "30days"?: TradeStrategy;
  "90days"?: TradeStrategy;
  "180days"?: TradeStrategy;
  "14 Days"?: TradeStrategy;
  "30 Days"?: TradeStrategy;
  "90 Days"?: TradeStrategy;
  "180 Days"?: TradeStrategy;
}

function allocation_num(x : string) {
  return parseFloat(x.replace("%", "")) / 100
}

export function ExeuteTrade() {
  const [amount, setAmount] = useState<string>("");
  const [strategies, setStrategies] = useState<AllStrategies>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>("14 Days");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentStrategy, setcurrentStrategy] = useState<TradeStrategy>();

  // 加载策略JSON文件
  const getCurrentStrategy = (): TradeStrategy => {
    // 尝试两种可能的键格式
    const strategy =
      strategies[selectedPeriod as keyof AllStrategies] ||
      strategies[selectedPeriod.toLowerCase() as keyof AllStrategies];
    return strategy!;
  };
  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/strategy.json");
        if (!response.ok) {
          throw new Error("无法加载策略文件");
        }
        const data: AllStrategies = await response.json();
        setStrategies(data);
        setcurrentStrategy(getCurrentStrategy())
        
        setError("");
      } catch (err) {
        console.error("加载策略文件失败:", err);
        setError("加载策略文件失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategy();
  }, []);



  const handleExecute = async () => {
    if (!amount || isNaN(Number(amount))) {
      console.error("请输入有效金额");
      return;
    }
    // TODO: 执行交易逻辑
    console.log("执行交易，金额:", amount)
    try {
        const strategy : TradeStrategy = getCurrentStrategy();
        //Lend Joule:
        const aptprice = await getaptprice();
        const pos1 = strategy.platforms?.Joule?.positions[0]!;
        const amount1 = allocation_num(pos1?.allocation)
        console.log(pos1, amount1);
        await Joule_lendToken(amount1, coin_address_map[pos1.asset], '2', false, coin_is_fungible[pos1.asset])
        //Borrow Joule: 
        await Joule_borrowToken(amount1 / aptprice * 0.7, coin_address_map["APT"], "2", true)
        //Lend Aries:
        const pos2 = strategy.platforms?.Aries?.positions[0]!;
        const amount2 = allocation_num(pos2?.allocation)
        console.log(pos2, amount2);
        await Aries_lendToken(amount2, pos2.asset)
        //Borrow Aries:
        await Aries_borrowToken(amount2 / aptprice * 0.7, "APT")
    } catch (error) {
        console.error(error);
    }
        
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>执行交易策略</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>加载策略中...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label>选择时间段</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="选择时间段" />
                </SelectTrigger>
                <SelectContent>·
                  <SelectItem value="14 Days">14天</SelectItem>
                  <SelectItem value="30 Days">30天</SelectItem>
                  <SelectItem value="90 Days">90天</SelectItem>
                  <SelectItem value="180 Days">180天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentStrategy && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">预期收益:</p>
                    <p>{currentStrategy.expected_return}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">风险指数:</p>
                    <p>{currentStrategy.risk_index}/100</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">平台分配:</p>
                  {Object.entries(currentStrategy.platforms).map(([platform, data]) => (
                    <div key={platform} className="mb-2">
                      <p className="font-medium">{platform}</p>
                      {data.positions.length > 0 ? (
                        <ul className="pl-4">
                          {data.positions.map((pos, idx) => (
                            <li key={idx} className="text-sm">
                              {pos.asset} ({pos.action}): {pos.allocation}
                              {pos.price_range && (
                                <span>
                                  {" "}
                                  - 价格区间: {pos.price_range.lower} - {pos.price_range.upper}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm">无仓位分配</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-4">
              <Input
                type="number"
                placeholder="输入金额 USDC"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleExecute} disabled={!currentStrategy}>
                执行
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
