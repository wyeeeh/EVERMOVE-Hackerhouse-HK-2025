import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface RiskSliderProps {
  apy: number;
  riskLimit: number;
  onApyChange?: (value: number) => void;
  onRiskChange?: (value: number) => void;
}

export function RiskSlider({ apy, riskLimit, onApyChange, onRiskChange }: RiskSliderProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Est. APY</span>
            <span>{apy}%</span>
          </div>
          <Slider
            value={[apy]}
            max={100}
            step={0.1}
            onValueChange={(value) => onApyChange?.(value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Risk Limit</span>
            <span>{riskLimit}</span>
          </div>
          <Slider
            value={[riskLimit]}
            max={50}
            step={1}
            onValueChange={(value) => onRiskChange?.(value[0])}
          />
        </div>
      </CardContent>
    </Card>
  );
}