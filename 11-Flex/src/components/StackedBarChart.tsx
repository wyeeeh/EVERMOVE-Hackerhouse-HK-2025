"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
    <Card>
      {/* <CardHeader>
        <CardTitle>Bar Chart - Stacked + Legend</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader> */}
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart 
            layout="vertical" 
            data={chartData} 
            height={60}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Bar
              dataKey="joule"
              stackId="a"
              fill={chartConfig.joule.color}
              radius={[4, 0, 0, 4]}
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
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
