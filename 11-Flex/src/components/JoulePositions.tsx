"use client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as AntIcons from "@ant-design/web3-icons";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";

import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { getWalletAddress } from "@/components/Main";
import { getUserAllPositions, getBalance } from "@/utils/JouleUtil";

// Token metadata
import { coin_address, coin_type, coin_decimals } from "@/constants";

interface JouleProps {
    isaptosAgentReady: boolean;
    onBalanceChange?: (balance: number) => void;
    onjouleValueChange?: (value: number) => void;  // 添加新的回调
  }

  export function JoulePositions({ isaptosAgentReady, onBalanceChange, onjouleValueChange }: JouleProps) {
  const [balance, setBalance] = useState(Number);
  const [userPositions, setUserPositions] = useState();

  useEffect(() => {
    if (!isaptosAgentReady) return;
    async function fetchData() {
      try {
        //get now positions in joule
        const userPositions = await getUserAllPositions(getWalletAddress());
        setUserPositions(userPositions);
        console.log(userPositions)
          const totalValue = userPositions?.value?.lend_positions?.data?.reduce((total: number, lendPosition: {key: string, value: number} ) => {
            const token = getTokenName(lendPosition.key.replace("@", "0x"));
            const amount = calculateActualAmount(lendPosition.value, lendPosition.key.replace("@", "0x"));
            return total + calculateTotalValue(amount, token);
          }, 0) ?? 0;
          
          onjouleValueChange?.(totalValue);

        // Get Balance
        const accountBalance = await getBalance();
        setBalance(accountBalance);
        onBalanceChange?.(accountBalance);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [isaptosAgentReady, onjouleValueChange]);

  const calculateActualAmount = (value: number, token: string): string => {
    let decimals = 0; // 默认 decimals

    if (token === coin_type.APT) {
      decimals = coin_decimals.APT;
    } else if (token === coin_type.USDC) {
      decimals = coin_decimals.USDC;
    } else if (token === coin_type.USDT) {
      decimals = coin_decimals.USDT;
    }

    return (value / Math.pow(10, decimals)).toFixed(2);
  };

  const getTokenName = (address: string): string => {
    switch (address) {
      case coin_type.APT:
        return "APT";
      case coin_type.USDC:
        return "USDC";
      case coin_type.USDT:
        return "USDT";
      default:
        return address;
    }
  };

  const APT_PRICE = 4.7;  // 添加 APT 价格常量

  const calculateTotalValue = (amount: string, token: string): number => {
    const numAmount = parseFloat(amount);
    if (token === "APT") {
      return numAmount * APT_PRICE;
    }
    return numAmount; // USDC 和 USDT 价格为 1
  };

  // 将symbol转换为AntDesign组件名称的映射函数
  const getIconComponentName = (symbol: string): string => {
    if (symbol.toLowerCase() === "eth") {
      return "EthereumCircleColorful";
    }
    const capitalizedSymbol = symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
    return `${capitalizedSymbol}CircleColorful`;
  };

  const [isExpanded, setIsExpanded] = useState(true);

  // Corrected return statement using shadcn UI card
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Joule Finance</CardTitle>
          {/* Total Value */}
          <CardDescription>
          Total Value: ${(userPositions as any)?.value?.lend_positions?.data?.reduce((total: number, lendPosition: {key: string, value: number}) => {
          const token = getTokenName(lendPosition.key.replace("@", "0x"));
          const amount = calculateActualAmount(lendPosition.value, lendPosition.key.replace("@", "0x"));
          return total + calculateTotalValue(amount, token);
          }, 0)?.toFixed(2) ?? "0.00"}
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
                    <TableHead>Coin</TableHead>
                    <TableHead>Lend</TableHead>
                    <TableHead>Borrow</TableHead>
                    <TableHead>Net APY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(userPositions as any)?.value?.lend_positions?.data || (userPositions as any)?.value?.borrow_positions?.data
                      ? (() => {
                          // 创建一个合并后的位置数据
                          const positionData = new Map();

                          // 处理借出位置
                          (userPositions as any)?.value?.lend_positions?.data?.forEach((lendPosition : {key: string, value: number}) => {
                            const coinKey = lendPosition.key.replace("@", "0x");
                            positionData.set(coinKey, {
                              position: (userPositions as any).value.position_name,
                              coin: getTokenName(coinKey),
                              lend: calculateActualAmount(lendPosition.value, coinKey),
                              borrow: "0",
                              apy: "-",
                            });
                          });
                          (userPositions as any)?.value?.borrow_positions?.data?.forEach((borrowPosition) => {
                            const coinKey = borrowPosition.value.coin_name.replace("@", "0x");
                            const existingData = positionData.get(coinKey) || {
                              position: (userPositions as any).value.position_name,
                              coin: getTokenName(coinKey),
                              lend: "0",
                              borrow: "0",
                              apy: "0",
                            };
                          
                            existingData.borrow = calculateActualAmount(borrowPosition.value.borrow_amount, coinKey);
                            existingData.apy = calculateActualAmount(borrowPosition.value.interest_accumulated, coinKey);
                            positionData.set(coinKey, existingData);
                          });

                          // 渲染合并后的数据
                          return Array.from(positionData.values()).map((data, index) => (
                            <TableRow key={`${userPositions?.key}-${index}`}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const IconComponent = AntIcons[getIconComponentName(data.coin) as keyof typeof AntIcons];
                                    return IconComponent ? <IconComponent style={{ fontSize: "24px" }} /> : null;
                                  })()}
                                  {data.coin}
                                </div>
                              </TableCell>
                              <TableCell>{data.lend}</TableCell>
                              <TableCell>{data.borrow}</TableCell>
                              <TableCell>{data.apy}</TableCell>
                            </TableRow>
                          ));
                      })()
                      : null}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
