"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { protocol: "joule", position: 275, fill: "var(--color-joule)" },
  { protocol: "aries", position: 200, fill: "var(--color-aries)" },
  { protocol: "hyperion", position: 287, fill: "var(--color-hyperion)" }
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

export function PortfolioChart() {
    const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("position")

  const totalPosition = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.position, 0)
  }, [])

  return (
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
  )
}
