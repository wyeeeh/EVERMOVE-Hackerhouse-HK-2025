"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataProps {
  term: string;
  joule: number;
  aries: number;
  hyperion: number;
}

interface PortfolioBarChartProps {
  data: ChartDataProps[];
}

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
} satisfies ChartConfig;

export function PortfolioBarChart({ data }: PortfolioBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-2 w-full">
      <BarChart
        layout="vertical" // 改为 vertical 实现横向堆叠
        data={data}
        height={12}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="term" hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="joule"
          stackId="a"
          fill={chartConfig.joule.color}
          radius={[4, 0, 0, 4]} // 左侧圆角
        />
        <Bar dataKey="aries" stackId="a" fill={chartConfig.aries.color} />
        <Bar
          dataKey="hyperion"
          stackId="a"
          fill={chartConfig.hyperion.color}
          radius={[0, 4, 4, 0]} // 右侧圆角
        />
      </BarChart>
    </ChartContainer>
  );
}
