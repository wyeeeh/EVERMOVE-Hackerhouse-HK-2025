import { StrategyCard } from "@/components/StrategyCard";
import { ChevronDown, ChevronUp,ChartCandlestick } from "lucide-react";

export function Strategy() {
  return (
    <div className="relative group">
    {/* div外发光效果 */}
    <div className="glow-effect" />
    
    {/* 主容器：上下左右边距、弹性布局、圆角、半透明背景、最大宽高限制、滚动条、边框 */}
    <div className="relative flex flex-col gap-4 p-8 rounded-lg bg-card overflow-auto border">
      {/* 标题栏：两端对齐布局 */}
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-bold">Strategy</h2>
        <ChartCandlestick />
      </div>
          <div id="strategy-grid" className="grid grid-cols-2 gap-4">
          <StrategyCard
                name="14 Days"
                apy="335%"
                risk={65}
                onAmountChange={(value) => console.log(value)}
            />
            <StrategyCard
                name="7 Days"
                apy="235%"
                risk={45} 
                onAmountChange={(value) => console.log(value)}
            />
            <StrategyCard
                name="3 Days"
                apy="135%"
                risk={25}
                onAmountChange={(value) => console.log(value)}
            />
            <StrategyCard
                name="1 Day"
                apy="100%"
                risk={10}
                onAmountChange={(value) => console.log(value)}
            />
          </div>
        </div>
    </div>
  );
}