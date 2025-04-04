import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionCard } from "@/components/PositionCard";
import { Button } from "@/components/ui/button";
import { Landmark, TrendingUp, WalletMinimal } from "lucide-react";
import { JoulePositions } from "@/components/JoulePositions";
import { HyperionPositions } from "@/components/HyperionPositions";
import { PortfolioChart } from "@/components/PortfolioChart";

interface PortfolioProps { isaptosAgentReady: boolean; ishyperionsdkReady: boolean }

export function NewPortfolio({ isaptosAgentReady, ishyperionsdkReady} : PortfolioProps) {
  const mockPositions = [
    { market: "Aries Market", asset: "USDC", position: "200K", apy: "8.89%", risk: "0.5" },
    { market: "Joule Finance", asset: "USDC", position: "10K", apy: "8.14%", risk: "1.5" },
  ];

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
      <PortfolioChart />
      </div>

      <div className="space-y-2">
        {mockPositions.map((position, index) => (
          <PositionCard key={index} {...position} />
        ))}
        <JoulePositions isaptosAgentReady={isaptosAgentReady}/>
        <HyperionPositions ishyperionsdkReady={ishyperionsdkReady}/>
      </div>
    </div>
    </div>
  );
}