import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { PortfolioBarChart } from "@/components/StackedBarChart";

interface StrategyCardProps {
  term: string;  // 14days, 30days, 90days, 180days
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
  onAmountChange?: (value: number) => void;
}

interface Strategy {
  [key: string]: {
    expected_return: number;
    risk_index: number;
    platforms: StrategyCardProps['platforms'];
  }
}


export function StrategyList() {
  const [strategies, setStrategies] = useState<Strategy | null>(null);

  useEffect(() => {
    fetch('/strategy.json')
      .then(response => response.json())
      .then(data => setStrategies(data))
      .catch(error => console.error('Error loading strategies:', error));
  }, []);

  return (
    <div className="space-y-4">
      {strategies && Object.entries(strategies).map(([term, strategy]) => (
        <StrategyCard
          key={term}
          term={term}
          expected_return={strategy.expected_return}
          risk_index={strategy.risk_index}
          platforms={strategy.platforms}
          onAmountChange={(value) => console.log(term, value)}
        />
      ))}
    </div>
  );
}

export function StrategyCard({ term, expected_return, risk_index, platforms, onAmountChange }: StrategyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
    onAmountChange?.(value[0]);
  };

  const renderPlatformAllocations = () => {
    return Object.entries(platforms).map(([platform, data]) => (
      <div key={platform} className="flex justify-between text-sm">
        <span>{platform}</span>
        <span>{data.positions.reduce((sum, pos) => 
          sum + parseInt(pos.allocation), 0
        )}%</span>
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{term}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <div className="flex">
            <span>Est. APY:</span>
            <span className="text-green-500">{expected_return}</span>
          </div>
          <div className="flex">
            <span>Risk:</span>
            <span className="text-green-500">{risk_index}%</span>
          </div>
        </div>
        <div id="positions">
        <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-2 pb-4">
                <PortfolioBarChart />
                  <div className="flex justify-between">
                    <div className="space-y-2">
                    {renderPlatformAllocations()}
                  </div>
                    <span>{amount}%</span>
                  </div>
                  <Slider
                    defaultValue={[0]}
                    max={100}
                    step={1}
                    onValueChange={handleSliderChange}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}