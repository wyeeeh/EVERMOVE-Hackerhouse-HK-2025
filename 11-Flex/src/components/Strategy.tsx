import { useState, useEffect } from "react";

import { StrategyCard } from "@/components/StrategyCard";
import { ChevronDown, ChevronUp,ChartCandlestick } from "lucide-react";

interface Strategy {
  [key: string]: {
    expected_return: number;
    risk_index: number;
    platforms: {
      Joule?: {
        positions: Array<{
          asset: string;
          action: string;
          allocation: string;
          rationale: string;
        }>;
      };
      Aries?: {
        positions: Array<{
          asset: string;
          action: string;
          allocation: string;
          rationale: string;
        }>;
      };
      Hyperion?: {
        positions: Array<{
          asset: string;
          action: string;
          allocation: string;
          fee_tier?: number;
          price_range?: {
            lower: number;
            upper: number;
          };
          rationale: string;
        }>;
      };
    };
  }
}

export function Strategy() {
  const [strategies, setStrategies] = useState<Strategy | null>(null);

  useEffect(() => {
    fetch('/strategy.json')
      .then(response => response.json())
      .then(data => setStrategies(data))
      .catch(error => console.error('Error loading strategies:', error));
  }, []);

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
          {strategies && Object.entries(strategies).map(([term, strategy]) => (
            <StrategyCard
              key={term}
              term={term}
              expected_return={strategy.expected_return}
              risk_index={strategy.risk_index}
              platforms={strategy.platforms}
              onAmountChange={(value) => console.log(`${term}: ${value}%`)}
            />
          ))}
        </div>
        </div>
    </div>
  );
}