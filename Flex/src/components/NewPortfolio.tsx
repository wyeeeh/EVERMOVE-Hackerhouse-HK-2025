import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionCard } from "./PositionCard";
import { Landmark, TrendingUp } from "lucide-react";

export function NewPortfolio() {
  const mockPositions = [
    { market: "Aries Market", asset: "USDC", position: "200K", apy: "8.89%", risk: "0.5" },
    { market: "Joule Finance", asset: "USDC", position: "10K", apy: "8.14%", risk: "1.5" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Landmark />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
          $200M
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp />
              24h Change
            </CardTitle>
          </CardHeader>
          <CardContent>
          +$3.5k
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {mockPositions.map((position, index) => (
          <PositionCard key={index} {...position} />
        ))}
      </div>
    </div>
  );
}