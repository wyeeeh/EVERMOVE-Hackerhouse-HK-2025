import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ChartCandlestick } from 'lucide-react';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";

// Merkle Trade Components
import { merkle, tokenList } from "@/components/Main";
import { OpenPosition, CloseAllPosition } from "@/entry-functions/merkleTrade";
import { StrategyCard } from "@/components/StrategyCard";

// Joule Finane Components
import { JouleAction } from "@/components/JouleAction";
import { AriesAction  } from "./AriesAction";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HyperionAction } from "./HyperionAction";



interface TradeUIProps {
  isClientReady: boolean; isaptosAgentReady: boolean; ishyperionsdkReady: boolean
}

/**
 * TradeUI组件 - 主要交易界面
 * 功能：
 * 1. 展示多个交易对的卡片列表
 * 2. 管理交易状态和用户输入
 * 3. 执行交易操作
 */
export function TradeUI({ isClientReady, isaptosAgentReady, ishyperionsdkReady}: TradeUIProps) {
  // 控制展开的卡片
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // 处理卡片展开/收起
  const handleToggle = (symbol: string) => {
    setExpandedCard(expandedCard === symbol ? null : symbol);
  };

  // 处理单个交易对金额变化
  const handleAmountChange = (symbol: string, newAmount: number) => {
    const index = tokenList.findIndex(token => token.symbol === symbol);
    if (index !== -1) {
      const newAmounts = [...amount];
      newAmounts[index] = newAmount;
      setTransferAmount(newAmounts);
    }
  };

  // 处理单个交易对杠杆倍数变化
  const handleLeverageChange = (symbol: string, newLeverage: number) => {
    const index = tokenList.findIndex(token => token.symbol === symbol);
    if (index !== -1) {
      const newLevers = [...lever];
      newLevers[index] = newLeverage;
      setLever(newLevers);
    }
  };

  // 处理单个交易对仓位方向变化
  const handlePositionChange = (symbol: string, newPosition: string) => {
    const index = tokenList.findIndex(token => token.symbol === symbol);
    if (index !== -1) {
      const newIsLong = [...islong];
      newIsLong[index] = newPosition === 'long';
      setLong(newIsLong);
    }
  };

  // 用户输入的总金额
  const [totalinput, settotalinput] = useState<number>(1000);
  
  // 各交易对的仓位方向状态(long/short)
  const [islong, setLong] = useState<boolean[]>(Array(tokenList.length).fill(true));
  
  // 各交易对的金额状态
  const [amount, setTransferAmount] = useState<number[]>(Array(tokenList.length).fill(0));
  
  // 各交易对的杠杆倍数状态
  const [lever, setLever] = useState<number[]>(Array(tokenList.length).fill(0));
  
  // 交易卡片数据配置
  let cards = tokenList.map((token, index) => ({
    symbol: token.symbol,
    amount: amount[index],
    leverageDefault: lever[index],
    position: islong[index] ? 'long' : 'short',
  }));
  
  const { account, signAndSubmitTransaction } = useWallet();    
  // 计算所有交易的总金额
  const totalAmount = cards.reduce((sum, card) => sum + card.amount, 0);
  
  // 按金额大小对卡片进行排序
  const sortedCards = [...cards].sort((a, b) => b.amount - a.amount);
  
  /**
   * 处理交易确认按钮点击
   * 执行多个交易对的开仓操作
   */
  const onClickButton = async () => {
    console.log(totalAmount);
    if (!account || !isClientReady) {
      return;
    }

    try {
        let CoinId: Map<string, number> = new Map([
            ['BTC_USD', 0], ['ETH_USD', 1], ['APT_USD', 2], ['SUI_USD', 3], ['TRUMP_USD', 4], ['DOGE_USD', 5]
        ]);
        let ordernum: bigint = 0n;
        let ordertype: number[] = [];
        let ordersizedelta: bigint[] = [];
        let orderamount: bigint[] = [];
        let orderside: boolean[] = [];
        
        for (let i = 0; i < tokenList.length; i++) { // move to batch tx; construct the argument of batchtx contract
            const n = BigInt(Math.floor(amount[i] * totalinput)) * 10_000n;
            if (n > 10_000_000n) {
                console.log("111",i,`${tokenList[i].symbol}_USD`, n, islong[i], lever[i], account.address, merkle);
                ordernum += 1n;
                if (CoinId.has(`${tokenList[i].symbol}_USD`)) {
                    ordertype.push(CoinId.get(`${tokenList[i].symbol}_USD`)!);
                } else {
                    throw new Error(`${tokenList[i].symbol}_USD not found in Coinmap`);
                }
                ordersizedelta.push(n * BigInt(lever[i]));
                orderamount.push(n);
                orderside.push(islong[i]);
                //const transaction = await OpenPosition(`${tokenList[i].symbol}_USD`, n, islong[i], lever[i], account.address, merkle);
                //const committedTransaction = await signAndSubmitTransaction(transaction);
                //await aptosClient().waitForTransaction({transactionHash: committedTransaction.hash});
            }
        }
        console.log("The number of txs", ordernum);
        const committedTransaction = await signAndSubmitTransaction({ // submit the batch tx
            data: {
              function: `0x827b56914a808d9f638252cd9b3c1229a2c2bc606eb4f70f53c741350f1dea0e::BatchCaller::batch_execute_merkle_market_v1`,
              functionArguments: [ordernum, ordertype, ordersizedelta, orderamount, orderside],
            }
            }
          );
        await aptosClient().waitForTransaction({transactionHash: committedTransaction.hash,});
      
        queryClient.invalidateQueries({
            queryKey: ["apt-balance", account?.address],
        });
    } catch (error) {
      console.error(error);
    }
  };

  const onClickButton_close = async() => {
    if (!account || !isClientReady) {
        return;
      }
    try{
        
      for (let i = 0; i < tokenList.length; i++) {
            const tx = await CloseAllPosition(`${tokenList[i].symbol}_USD`, account.address, merkle);
            if(tx != undefined) {
                const committedTransaction = await signAndSubmitTransaction(tx);
                await aptosClient().waitForTransaction({transactionHash: committedTransaction.hash});
            }
        }
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    // Define the function to fetch and process data
    const fetchTradeData = async () => {
      try {
        const response = await fetch('/result.jsonl.pretty.json');
        const tradeData = await response.json();
        // Extract position percentages and leverage values from actions
        const portion_result = tradeData.actions.map((action: { position_percentage: number }) => action.position_percentage);
        const leverageValues = tradeData.actions.map((action: { leverage: number }) => action.leverage);
        
        // Set the state with actual data
        setTransferAmount(portion_result);
        setLever(leverageValues.map((leverage: number) => Math.abs(leverage)));
        // Determine long/short based on leverage sign (positive = long, negative = short)
        setLong(leverageValues.map((leverage: number) => leverage > 0));
      } catch (error) {
        console.error('Error fetching trade data:', error);
        // Fallback to random values if fetch fails
        // ... existing random generation code ...
      }
    };

    // Initial fetch
    fetchTradeData();

    // Set up polling interval (e.g., every 10 seconds)
    const intervalId = setInterval(fetchTradeData, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div className="relative group">
    {/* div外发光效果 */}
    <div className="glow-effect" />
    
    {/* 主容器：上下左右边距、弹性布局、圆角、半透明背景、最大宽高限制、滚动条、边框 */}
    <div className="relative flex flex-col gap-4 p-4 md:p-8 rounded-lg bg-card w-full max-w-[600px] overflow-auto border">
    {/* <div className="mt-4 mr-4 flex flex-col gap-4 p-4 md:p-8 rounded-lg bg-card w-full max-w-[600px] border-2 border-white/50"> */}
      {/* 标题栏：两端对齐布局 */}
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-bold">Merkle Trade</h2>
        <ChartCandlestick />
      </div>
      <div className="space-y-2">
        {sortedCards.map(card => (
          <StrategyCard
            name="14 Days"
            apy="335%"
            risk={65}
            onAmountChange={(value) => console.log(value)}
        />
        ))}
      </div>
      {/* 添加底部栏 */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span>Amount</span>
            <Input
              type="number"
              onChange={(e) => settotalinput(Number(e.target.value))}
              placeholder={`${totalAmount} USDC`}
              className="w-36"
            />
          </div>
          <Button onClick={onClickButton}>
            Execute
          </Button>
          <Button onClick={onClickButton_close}>
            Close all position
          </Button>
          
        </div>
      </div>



      {/* 标题栏：两端对齐布局 */}
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-bold">Joule Finance</h2>
        <ChartCandlestick />
      </div>
      <div className="space-y-2">
      <AriesAction isaptosAgentReady={isaptosAgentReady} />
      </div>
      <div className="space-y-2">
      <JouleAction isaptosAgentReady={isaptosAgentReady} />
      </div>
      <div className="space-y-2">
      <HyperionAction ishyperionsdkReady={ishyperionsdkReady} />
      </div>
      </div>
    </div>
  );
}