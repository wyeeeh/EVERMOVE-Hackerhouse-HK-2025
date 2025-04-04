"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    {
      term: "14 days",
      joule: 30,
      aries: 12,
      hyperion: 40,
    }
  ];
  
  const chartConfig = {
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

export function PortfolioBarChart() {
  return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart 
            layout="horizontal" 
            data={chartData} 
            height={60}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="joule"
              stackId="a"
              fill={chartConfig.joule.color}
            />
            <Bar
              dataKey="aries"
              stackId="a"
              fill={chartConfig.aries.color}
            />
            <Bar
              dataKey="hyperion"
              stackId="a"
              fill={chartConfig.hyperion.color}
            />
          </BarChart>
        </ChartContainer>
  )
}
