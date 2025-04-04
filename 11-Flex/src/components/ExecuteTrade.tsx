import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Joule_borrowToken, Joule_lendToken } from "@/utils/JouleUtil"
import { Aries_borrowToken, Aries_lendToken } from "@/utils/AriesUtil"
import { coin_address_map, coin_is_fungible, coin_decimals, coin_decimals_map } from "@/constants"
import { getaptprice } from "@/utils/HyperionUtil"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, ShieldAlert, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { create_hyperion_positions } from "@/utils/HyperionUtil"

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
  "14 Days"?: TradeStrategy;
  "30 Days"?: TradeStrategy;
  "90 Days"?: TradeStrategy;
  "180 Days"?: TradeStrategy;
}

function allocation_num(x: string) {
  return parseFloat(x.replace("%", "")) / 100;
}

export function ExeuteTrade() {
  const [amount, setAmount] = useState<string>("");
  const [strategies, setStrategies] = useState<AllStrategies>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>("14 Days");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentStrategy, setCurrentStrategy] = useState<TradeStrategy>();
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // 获取当前选择的策略
  const getCurrentStrategy = (): TradeStrategy => {
    const strategy =
      strategies[selectedPeriod as keyof AllStrategies] ||
      strategies[selectedPeriod.toLowerCase() as keyof AllStrategies];
    return strategy!;
  };

  // 策略变更时更新当前策略
  useEffect(() => {
    if (Object.keys(strategies).length > 0) {
      try {
        const strategy = getCurrentStrategy();
        setCurrentStrategy(strategy);
      } catch (err) {
        console.error("更新当前策略失败:", err);
      }
    }
  }, [selectedPeriod, strategies]);

  // 加载策略JSON文件
  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        setIsLoading(true);
        // 添加时间戳避免缓存
        const timestamp = new Date().getTime();
        const response = await fetch(`/strategy.json?t=${timestamp}`);
        if (!response.ok) {
          throw new Error("无法加载策略文件");
        }
        const data: AllStrategies = await response.json();
        setStrategies(data);

        // 设置最后更新时间
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString());

        setError("");
      } catch (err) {
        console.error("加载策略文件失败:", err);
        setError("加载策略文件失败");
      } finally {
        setIsLoading(false);
      }
    };

    // 初始加载
    fetchStrategy();

    // 定时刷新，每10秒检查一次更新
    const intervalId = setInterval(fetchStrategy, 10000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);

  // 获取风险等级对应的颜色
  const getRiskColor = (riskIndex: number): string => {
    if (riskIndex < 40) return "bg-green-500";
    if (riskIndex < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  // 执行交易
  const handleExecute = async () => {
    if (!amount || isNaN(Number(amount))) {
      console.error("请输入有效金额");
      return;
    }

    setIsExecuting(true);

    try {
        const strategy : TradeStrategy = getCurrentStrategy();
        //Lend Joule:
        const aptprice = await getaptprice();
        const pos1 = strategy.platforms?.Joule?.positions[0]!;
        const amount1 = allocation_num(pos1?.allocation) * Math.pow(10, coin_decimals_map[pos1.asset])
        console.log(pos1, amount1);
        await Joule_lendToken(amount1 , coin_address_map[pos1.asset], '2', false, coin_is_fungible[pos1.asset])
        //Borrow Joule: 
        await Joule_borrowToken(Number(Math.floor(amount1 / aptprice * 0.7 * 100)), coin_address_map["APT"], "2", false)
        //Lend Aries:
        const pos2 = strategy.platforms?.Aries?.positions[0]!;
        const amount2 = allocation_num(pos2?.allocation) * Math.pow(10, coin_decimals_map[pos2.asset])
        console.log(pos2, amount2);
        await Aries_lendToken(amount2, pos2.asset)
        //Borrow Aries:
        await Aries_borrowToken(Number(Math.floor(amount2 / aptprice * 0.7 * 100)), "APT")
        //Create Hyperion:
        //const amount3 = allocation_num(pos2?.allocation) * Math.pow(10, coin_decimals_map[pos2.asset])
        //await create_hyperion_positions()
    } catch (error) {
      console.error("执行交易失败:", error);
      alert(`交易执行失败: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-t-4 border-t-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">执行交易策略</CardTitle>
            <CardDescription>
              选择时间段并输入金额来执行投资策略
              {lastUpdated && <span className="ml-2 text-xs opacity-70">最后更新: {lastUpdated}</span>}
            </CardDescription>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !currentStrategy ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p>加载策略中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p className="font-semibold">加载失败</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              重试
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex flex-col space-y-2 mb-4">
                <label className="font-medium">选择投资周期</label>
                <Tabs defaultValue={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="14 Days">14天</TabsTrigger>
                    <TabsTrigger value="30 Days">30天</TabsTrigger>
                    <TabsTrigger value="90 Days">90天</TabsTrigger>
                    <TabsTrigger value="180 Days">180天</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {currentStrategy && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        <p className="text-sm font-semibold">预期收益</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">{currentStrategy.expected_return}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex items-center mb-1">
                        <ShieldAlert className="h-4 w-4 mr-2 text-amber-600" />
                        <p className="text-sm font-semibold">风险指数</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xl font-bold">{currentStrategy.risk_index}</p>
                        <div className="ml-2 flex-1">
                          <div className={`h-2 w-full rounded-full overflow-hidden bg-gray-200`}>
                            <div
                              className={`h-full ${getRiskColor(currentStrategy.risk_index)}`}
                              style={{ width: `${currentStrategy.risk_index}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <div className="flex items-center mb-3">
                      <Coins className="h-4 w-4 mr-2 text-blue-600" />
                      <p className="text-sm font-semibold">资产分配</p>
                    </div>
                    <div className="space-y-4">
                      {Object.entries(currentStrategy.platforms).map(([platform, data]) => (
                        <div key={platform} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            <Badge variant="outline" className="mr-2">
                              {platform}
                            </Badge>
                          </div>
                          {data.positions.length > 0 ? (
                            <ul className="space-y-2">
                              {data.positions.map((pos, idx) => (
                                <li key={idx} className="bg-slate-50 p-2 rounded-md text-sm">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {pos.asset} ({pos.action})
                                    </span>
                                    <span className="font-semibold">{pos.allocation}</span>
                                  </div>
                                  <div className="text-xs text-slate-600 mt-1">{pos.rationale}</div>
                                  {pos.price_range && (
                                    <div className="mt-1 text-xs bg-blue-50 p-1 rounded">
                                      价格区间: {pos.price_range.lower} - {pos.price_range.upper}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500">无仓位分配</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Input
                  type="number"
                  placeholder="输入金额 USDC"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button
                  onClick={handleExecute}
                  disabled={!currentStrategy || isExecuting || !amount}
                  className="whitespace-nowrap"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      执行中
                    </>
                  ) : (
                    "执行交易"
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">*执行交易将按照选定策略分配您的资产</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
