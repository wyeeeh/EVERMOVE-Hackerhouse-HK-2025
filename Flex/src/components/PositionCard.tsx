import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface PositionCardProps {
  market: string;
  asset: string;
  position: string;
  apy: string;
  risk: string;
}

export function PositionCard({ market, asset, position, apy, risk }: PositionCardProps) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      exit={{ height: 0 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{market}</CardTitle>
          <ChevronDown className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>Asset: {asset}</div>
            <div>Position: {position}</div>
            <div>APY: {apy}</div>
            <div>Risk Factor: {risk}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}