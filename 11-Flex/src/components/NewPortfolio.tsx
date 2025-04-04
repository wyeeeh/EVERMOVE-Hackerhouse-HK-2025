import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionCard } from "@/components/PositionCard";
import { Button } from "@/components/ui/button";
import { Landmark, TrendingUp, WalletMinimal } from "lucide-react";

// Positions
import { JoulePositions } from "@/components/JoulePositions";
import { HyperionPositions } from "@/components/HyperionPositions";
import {AriesPositions} from "@/components/AriesPositions"
import { AriesAction } from "./AriesAction";


import React, { useEffect, useState } from "react"; // Import React to define JSX types

// Chart components
import { Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"



interface PortfolioProps { isaptosAgentReady: boolean; ishyperionsdkReady: boolean }

export function NewPortfolio({ isaptosAgentReady, ishyperionsdkReady} : PortfolioProps) {
  const [ariesValue, setariesValue] = useState(0);
  const [jouleValue, setjouleValue] = useState(0);
  const [hyperionValue, setHyperionValue] = useState(0);

  const chartData = [
    { protocol: "joule", position: jouleValue, fill: "var(--color-joule)" },
    { protocol: "aries", position: ariesValue, fill: "var(--color-aries)" },
    { protocol: "hyperion", position: hyperionValue, fill: "var(--color-hyperion)" }
  ]
  const chartConfig = {
    position: {
      label: "Total",
    },
    joule: {
      label: "Joule",
      color: "hsl(var(--chart-1))",
    },
    aries: {
      label: "Aries",
      color: "hsl(var(--chart-2))",
    },
    hyperion: {
      label: "Hyperion",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig
  
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("position")

  const totalPosition = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.position, 0)
  }, [])


  return (
  <div className="relative group">
    {/* div外发光效果 */}
    <div className="glow-effect" />
    
    {/* 主容器：上下左右边距、弹性布局、圆角、半透明背景、最大宽高限制、滚动条、边框 */}
    <div className="relative flex flex-col gap-4 p-8 rounded-lg bg-card overflow-auto border">
      {/* 标题栏：两端对齐布局 */}
      <div className="flex items-center justify-between space-y-0 pb-2">
        <div className="text-2xl font-bold">Portfolio</div>
        <WalletMinimal />
      </div>

      <div id="PortfolioChart">
      <Card className="flex flex-col">
      {/* <CardHeader className="items-center pb-0">
        <CardTitle>Portfolio</CardTitle>
        <CardDescription>Protocol Position</CardDescription>
      </CardHeader> */}
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="position"
              nameKey="protocol"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          ${totalPosition.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Value
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Position Distribution <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Current positions across all protocols
        </div>
      </CardFooter> */}
      <div className="flex">
          {Object.keys(chartConfig).map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  ${chart === "position" ? totalPosition.toLocaleString() : (chartData.find(item => item.protocol === chart)?.position || 0).toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
    </Card>
      </div>

      <div className="space-y-6">
        <JoulePositions isaptosAgentReady={isaptosAgentReady}
        onjouleValueChange={setjouleValue}/>
        
        <AriesPositions isaptosAgentReady={isaptosAgentReady}
        onTotalValueChange={setariesValue}/>
        
        <HyperionPositions ishyperionsdkReady={ishyperionsdkReady}
        onhyperionValueChange={setHyperionValue}/>
      
      </div>
      <div className="space-y-2">
        <AriesAction isaptosAgentReady={isaptosAgentReady} />
       </div>
    </div>
    </div>
  );
}