import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface StrategyCardProps {
  name: string;
  apy: string;
  risk: string;
}

export function StrategyCard({ name, apy, risk }: StrategyCardProps) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      exit={{ height: 0 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <ChevronDown className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-green-500">Est. APY: {apy}</div>
            <div>Risk Factor: {risk}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}