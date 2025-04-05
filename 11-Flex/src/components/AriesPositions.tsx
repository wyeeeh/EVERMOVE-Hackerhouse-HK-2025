"use client"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import {getWalletAddress} from "@/components/Main";
import { getUserDeposit, getUserLoan, Position, getAllPostion} from "@/utils/AriesUtil";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import * as AntIcons from "@ant-design/web3-icons";

interface AgentUIProps {
    isaptosAgentReady: boolean;
    onTotalValueChange?: (value: number) => void;  // 添加回调属性
}

export function AriesPositions({ isaptosAgentReady , onTotalValueChange}: AgentUIProps) {
    //const [Deposit, setDeposit] = useState();
    //const [Loan, setLoan] = useState();
    const [positions, setPositions] = useState<Position[]>([]);
    
    useEffect(() => {
        if(!isaptosAgentReady) return
        async function fetchData() {
            try {
                //get now positions in joule
                //const deposits = await getUserDeposit(getWalletAddress(), "USDC")
                //const loans = await getUserLoan(getWalletAddress(), "APT")
                const data = await getAllPostion(getWalletAddress()) 
                setPositions(data)
                const totalValue = data.reduce((total, position) => total + position.lend, 0);
                onTotalValueChange?.(totalValue);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [isaptosAgentReady, onTotalValueChange]);

    const [isExpanded, setIsExpanded] = useState(true);

    // 将symbol转换为AntDesign组件名称的映射函数
      const getIconComponentName = (symbol: string): string => {
        if (symbol.toLowerCase() === "eth") {
          return "EthereumCircleColorful";
        }
        const capitalizedSymbol = symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
        return `${capitalizedSymbol}CircleColorful`;
      };
    return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aries</CardTitle>
              <CardDescription>
              Total Value: ${positions.reduce((total, position) => total + position.lend, 0).toFixed(4)}
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
                            <TableCell>
                                <div className="flex items-center gap-2">
                                {(() => {
                                  const IconComponent = AntIcons[getIconComponentName(position.coin) as keyof typeof AntIcons];
                                  return IconComponent ? <IconComponent style={{ fontSize: "24px" }} /> : null;
                                })()}
                                {position.coin}
                              </div>
                            </TableCell>
                            <TableCell>{position.lend.toFixed(4)}</TableCell>
                            <TableCell>{position.borrow.toFixed(4)}</TableCell>
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