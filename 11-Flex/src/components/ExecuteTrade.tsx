import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Loader2, TrendingUp, ShieldAlert, Coins } from "lucide-react";

import { coin_address_map, coin_is_fungible, coin_decimals, coin_decimals_map } from "@/constants";
import { Joule_borrowToken, Joule_lendToken } from "@/utils/JouleUtil";
import { Aries_borrowToken, Aries_lendToken } from "@/utils/AriesUtil";
import { getaptprice, create_hyperion_positions } from "@/utils/HyperionUtil";

import { PortfolioBarChart } from "@/components/StackedBarChart";

import { useState, useEffect } from "react";

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
    if (riskIndex < 40) return "[&>*]:bg-green-500";
    if (riskIndex < 70) return "[&>*]:bg-yellow-500";
    return "[&>*]:bg-red-500";
  };

  // 执行交易
  const handleExecute = async () => {
    if (!amount || isNaN(Number(amount))) {
      console.error("请输入有效金额");
      return;
    }

    setIsExecuting(true);

    try {
      const strategy: TradeStrategy = getCurrentStrategy();
      //Lend Joule:
      let aptprice = await getaptprice();
      const pos1 = strategy.platforms?.Joule?.positions[0]!;
      const amount1 = Number(amount) * allocation_num(pos1?.allocation) * Math.pow(10, coin_decimals_map[pos1.asset]);
      await Joule_lendToken(amount1, coin_address_map[pos1.asset], "2", false, coin_is_fungible[pos1.asset]);
      //Borrow Joule:
      await Joule_borrowToken(
        Number(Math.floor((amount1 / aptprice) * 0.7 * 100)),
        coin_address_map["APT"],
        "2",
        false,
      );
      //Lend Aries:
      const pos2 = strategy.platforms?.Aries?.positions[0]!;
      const amount2 = Number(amount) * allocation_num(pos2?.allocation) * Math.pow(10, coin_decimals_map[pos2.asset]);
      await Aries_lendToken(amount2, pos2.asset);
      //Borrow Aries:
      await Aries_borrowToken(Number(Math.floor((amount2 / aptprice) * 0.7 * 100)), "APT");
      //Create Hyperion:
      const pos3 = strategy.platforms?.Hyperion?.positions[0]!;
      let amount3 = Number(amount) * allocation_num(pos3?.allocation) * Math.pow(10, coin_decimals_map[pos2.asset]);
      amount3 = Math.floor(((amount3 / aptprice) * 100) / 2);
      aptprice = await getaptprice();
      await create_hyperion_positions(amount3, pos3.price_range!.lower, pos3.price_range!.upper);
    } catch (error) {
      console.error("执行交易失败:", error);
      alert(`交易执行失败: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // 声明PlatformKey类型
  type PlatformKey = keyof TradeStrategy['platforms'];

  // 滑块联动函数
  const handleSliderChange = (platform: string, value: number) => {
    if (!currentStrategy) return;
    
    // 确保 platform 是有效的平台键
    if (!['Joule', 'Aries', 'Hyperion'].includes(platform)) return;
    
    const platformKey = platform as PlatformKey;
    const remainingPlatforms = (Object.keys(currentStrategy.platforms) as PlatformKey[])
      .filter(p => p !== platformKey);
      
    const currentAmounts = Object.entries(currentStrategy.platforms).reduce((acc, [p, data]) => {
      acc[p as PlatformKey] = allocation_num(data?.positions[0]?.allocation || "0%");
      return acc;
    }, {} as Record<PlatformKey, number>);
    
    const remainingRatio = remainingPlatforms.reduce((acc, p) => acc + currentAmounts[p], 0);
    const ratios = remainingPlatforms.reduce((acc, p) => {
      acc[p] = remainingRatio === 0 ? 1/remainingPlatforms.length : currentAmounts[p] / remainingRatio;
      return acc;
    }, {} as Record<PlatformKey, number>);
  
    const remaining = 1 - value;
    const updatedStrategy = { ...currentStrategy };
    
    // 更新当前平台的分配
    if (updatedStrategy.platforms[platformKey]?.positions[0]) {
      updatedStrategy.platforms[platformKey]!.positions[0].allocation = `${(value * 100).toFixed(0)}%`;
    }
    
    // 更新其他平台的分配
    remainingPlatforms.forEach(p => {
      if (updatedStrategy.platforms[p]?.positions[0]) {
        updatedStrategy.platforms[p]!.positions[0].allocation = 
          `${(remaining * ratios[p] * 100).toFixed(0)}%`;
      }
    });
  
    setCurrentStrategy(updatedStrategy);

    console.log("Updated strategy:", updatedStrategy);
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
                    <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <div className="text-base font-semibold">预期收益</div>
                      </CardTitle>
                    </CardHeader>
                      <CardContent>
                      <p className="text-2xl font-bold">
                        {currentStrategy.expected_return}%
                      </p>
                      </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        <div className="text-base font-semibold">风险指数</div>
                      </CardTitle>
                    </CardHeader>
                      <CardContent>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold">
                          {currentStrategy.risk_index}
                        </p>
                        <div className="ml-2 flex-1">
                          <Progress 
                            value={currentStrategy.risk_index} 
                            className={getRiskColor(currentStrategy.risk_index)}
                          />
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  </div>


                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        <div className="text-base font-semibold">资产分配</div>
                      </CardTitle>
                    </CardHeader>
                      <CardContent>
                      <div className="h-24 flex">
                    <PortfolioBarChart
                      data={[{
                        term: selectedPeriod,
                        joule: currentStrategy.platforms?.Joule?.positions.reduce(
                          (sum, pos) => sum + parseInt(pos.allocation), 0
                        ) || 0,
                        aries: currentStrategy.platforms?.Aries?.positions.reduce(
                          (sum, pos) => sum + parseInt(pos.allocation), 0
                        ) || 0,
                        hyperion: currentStrategy.platforms?.Hyperion?.positions.reduce(
                          (sum, pos) => sum + parseInt(pos.allocation), 0
                        ) || 0,
                      }]}
                    />
                    </div>
                    
                    <div className="space-y-4" id="positionAllocationCard">
                    {Object.entries(currentStrategy.platforms).map(([platform, data]) => (
    <div key={platform} className="">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="mr-2">
          {platform}
        </Badge>
        <span className="font-semibold">{data.positions[0]?.allocation}</span>
      </div>
      {data.positions.length > 0 ? (
        <ul className="space-y-2">
          {data.positions.map((pos, idx) => (
            <div className="bg-slate-50 p-4 rounded-md text-sm space-y-2">
            <li key={idx}>
              <div className="flex justify-between">
                <span className="font-medium">
                  {pos.asset} ({pos.action})
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1">{pos.rationale}</div>
              {pos.price_range && (
                <div className="mt-1 text-xs bg-blue-50 p-1 rounded">
                  价格区间: {pos.price_range.lower} - {pos.price_range.upper}
                </div>
              )}
            </li>

            <Slider
        value={[allocation_num(data.positions[0]?.allocation || "0%") * 100]}
        max={100}
        step={1}
        onValueChange={(value) => handleSliderChange(platform, value[0] / 100)}
        className="mb-2"
      />
            </div>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">无仓位分配</p>
      )}
      
    </div>
  ))}
                    </div>

                      </CardContent>
                    </Card>
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
