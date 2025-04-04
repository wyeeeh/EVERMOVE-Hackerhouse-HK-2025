import { StrategyCard } from "@/components/StrategyCard";
import { RiskSlider } from "@/components/RiskSlider";
import { useState } from "react";

export function NewStrategy() {
  const [apy, setApy] = useState(21.3);
  const [riskLimit, setRiskLimit] = useState(15);

  const mockStrategies = [
    { name: "Strategy 1", apy: "335%", risk: "65" },
    { name: "Strategy 2", apy: "56.3%", risk: "45" },
    { name: "Strategy 3", apy: "21.25%", risk: "15" },
    { name: "Strategy 4", apy: "5.25%", risk: "5" },
  ];

  return (
    <div className="space-y-2">
      <RiskSlider 
        apy={apy} 
        riskLimit={riskLimit}
        onApyChange={(value) => setApy(value)}
        onRiskChange={(value) => setRiskLimit(value)}
      />
      {mockStrategies.map((strategy, index) => (
        <StrategyCard key={index} {...strategy} />
      ))}
    </div>
  );
}