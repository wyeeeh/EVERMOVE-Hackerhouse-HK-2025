import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronUp, ChartCandlestick } from "lucide-react";

import { useToast } from "@/hooks/use-toast";



import { useState } from "react";
 
interface UserPreferenceSliderProps {
  apy: number;
  riskLimit: string; // 改为 string 类型
  onApyChange?: (value: number) => void;
  onRiskChange?: (value: string) => void;
}

export function UserPreferenceSlider({ apy, riskLimit, onApyChange, onRiskChange }: UserPreferenceSliderProps) {
  const { toast } = useToast();

  // Progress bar
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalyzing = () => {
    setIsAnalyzing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + (100 / 80);  // 80秒完成
      });
    }, 1000);  // 每秒更新
  };

  const handleApyChange = (value: number) => {
    if (value > 30 && (riskLimit === "lowest" || riskLimit === "low")) {
      toast({
        variant: "destructive",
        title: "Risk Warning",
        description: "High APY target may not be achievable with low risk settings.",
      });
    }
    onApyChange?.(value);
  };

  const handleRiskChange = (value: string) => {
    onRiskChange?.(value);
    if (value === "lowest" && apy > 30) {
      toast({
        variant: "destructive",
        title: "Risk Warning",
        description: "Lowest risk settings may not be achievable with high APY target.",
      });
    }
    if (value === "low" && apy > 30) {
      toast({
        variant: "destructive",
        title: "Risk Warning",
        description: "Low risk settings may not be achievable with high APY target.",
      });
    }
  };

  return (
    <div className="relative group">
      {/* div外发光效果 */}
      <div className="glow-effect" />

      {/* 主容器：上下左右边距、弹性布局、圆角、半透明背景、最大宽高限制、滚动条、边框 */}
      <div className="relative flex flex-col gap-4 p-8 rounded-lg bg-card overflow-auto border">
        {/* 标题栏：两端对齐布局 */}
        <div className="flex items-center justify-between space-y-0 pb-2">
          <span className="text-2xl font-bold">Preferences</span>
          <ChartCandlestick />
        </div>
        <Card>
          <CardContent className="p-6 space-y-10">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">Est. APY</span>
                <span>{apy}%</span>
              </div>
              <Slider value={[apy]} max={200} step={0.1} onValueChange={(value) => handleApyChange(value[0])} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">Risk Limit</span>
              </div>
              <RadioGroup
                value={riskLimit}
                onValueChange={(value) => handleRiskChange(value)}
                className="flex justify-between"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lowest" id="lowest" />
                  <label htmlFor="lowest">Lowest</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <label htmlFor="low">Low</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <label htmlFor="medium">Medium</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <label htmlFor="high">High</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="super_high" id="super_high" />
                  <label htmlFor="super_high">Super High</label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        <Button 
          onClick={startAnalyzing}
          disabled={isAnalyzing}
        > 
          {isAnalyzing ? "Analyzing..." : "Start Analyzing"}
        </Button>
        {isAnalyzing && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        )}

      </div>
    </div>
        
  );
}
