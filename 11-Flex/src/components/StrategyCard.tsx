import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface StrategyCardProps {
  name: string;
  apy: string;
  risk: number;
  onAmountChange?: (value: number) => void;
}

export function StrategyCard({ name, apy, risk, onAmountChange }: StrategyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
    onAmountChange?.(value[0]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
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
          <div className="flex gap-2">
            <span>Est. APY:</span>
            <span className="text-green-500">{apy}</span>
          </div>
          <div className="flex gap-2">
            <span>Risk Factor:</span>
            <span className="text-green-500">{risk}%</span>
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
                  <div className="flex justify-between">
                    <span>Amount</span>
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