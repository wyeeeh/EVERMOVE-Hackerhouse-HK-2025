"use client";
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as AntIcons from "@ant-design/web3-icons";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getaptprice } from "@/utils/HyperionUtil";

import { get_hyperion_positions, Position } from "@/utils/HyperionUtil";
interface HyperionProps {
  ishyperionsdkReady: boolean;
  onhyperionValueChange?: (value: number) => void;  // 添加回调属性
}

export function HyperionPositions({ ishyperionsdkReady, onhyperionValueChange }: HyperionProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  useEffect(() => {
    if (!ishyperionsdkReady) return;
    async function fetchData() {
      try {
        const data = await get_hyperion_positions();
        setPositions(data);
        console.log(data);

        // 计算并传递总价值
        const totalValue = data.reduce((total, position) => total + position.value, 0);
        onhyperionValueChange?.(totalValue);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [ishyperionsdkReady, onhyperionValueChange]);

  console.log("Positions:", positions);

  // 将symbol转换为AntDesign组件名称的映射函数
  const getIconComponentName = (symbol: string): string => {
    if (symbol.toLowerCase() === "eth") {
      return "EthereumCircleColorful";
    }
    const capitalizedSymbol = symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
    return `${capitalizedSymbol}CircleColorful`;
  };

  const renderTokenPair = (pair: string) => {
    const [token1, token2] = pair.split("_");
    return (
      <div className="flex items-center gap-2">
        {(() => {
          const IconComponent = AntIcons[getIconComponentName(token1) as keyof typeof AntIcons];
          return IconComponent ? <IconComponent style={{ fontSize: "24px" }} /> : null;
        })()}{" "}
        {token1}
        {(() => {
          const IconComponent = AntIcons[getIconComponentName(token2) as keyof typeof AntIcons];
          return IconComponent ? <IconComponent style={{ fontSize: "24px" }} /> : null;
        })()}{" "}
        {token2}
      </div>
    );
  };

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Hyperion</CardTitle>
          <CardDescription>
              Total Value: ${positions.reduce((total, position) => total + position.value, 0).toFixed(2)}
            </CardDescription>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={20} />
            </motion.div>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Upper Price</TableHead>
                    <TableHead>Lower Price</TableHead>
                    <TableHead>Est. APY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No positions available
                      </TableCell>
                    </TableRow>
                  ) : (
                    positions.map((position, index) => (
                      <TableRow key={index}>
                        <TableCell>{renderTokenPair(position.pair)}</TableCell>
                        <TableCell>${position.value.toFixed(2)}</TableCell>
                        <TableCell>${position.current_price.toFixed(2)}</TableCell>
                        <TableCell>${position.upper_price.toFixed(2)}</TableCell>
                        <TableCell>${position.lower_price.toFixed(2)}</TableCell>
                        <TableCell>{position.estapy.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
