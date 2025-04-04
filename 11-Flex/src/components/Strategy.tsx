import { StrategyCard } from "@/components/StrategyCard";
import { ChevronDown, ChevronUp,ChartCandlestick } from "lucide-react";

export function Strategy() {


  return (
    <div className="relative group mt-4 ml-4">
    {/* div外发光效果 */}
    <div className="glow-effect" />
    
    {/* 主容器：上下左右边距、弹性布局、圆角、半透明背景、最大宽高限制、滚动条、边框 */}
    <div className="relative flex flex-col gap-4 p-4 md:p-8 rounded-lg bg-card w-full max-w-[600px] overflow-auto border">
      {/* 标题栏：两端对齐布局 */}
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-bold">Strategy</h2>
        <ChartCandlestick />
      </div>
          <StrategyCard
                name="14 Days"
                apy="335%"
                risk={65}
                onAmountChange={(value) => console.log(value)}
            />
        </div>
    </div>
  );
}