"use client"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import {getWalletAddress} from "@/components/Main";
import {getUserAllPositions, getBalance} from "@/utils/JouleUtil"

interface AgentUIProps {
    isaptosAgentReady: boolean;
    onBalanceChange?: (balance: number) => void;
}

export function JoulePositions({ isaptosAgentReady, onBalanceChange }: AgentUIProps) {
    const [balance, setBalance] = useState(Number);
    const [userPositions, setUserPositions] = useState();

    
    //const TESTUSDT = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::test_tokens::USDT"
    const MAINUSDC = "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
    const FAUSDC = "@bae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"

    const FAUSDT = "@357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b"
    const MAINUSDT = "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b"

    // 地址到代币名称的映射
    const tokenAddressToName: { [key: string]: string } = {
        [FAUSDC]: "Faucet-USDC",
        [MAINUSDC]: "Mainnet-USDC",
        [FAUSDT]: "Faucet-USDT",
        [MAINUSDT]: "Mainnet-USDT"
    }

    // 将地址转换为可读的代币名称
    const getTokenName = (address: string): string => {
        return tokenAddressToName[address] || address
    }
    
    //const TESTWETH = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::test_tokens::WETH"
    
    useEffect(() => {
        if(!isaptosAgentReady) return
        async function fetchData() {
            try {
                //get now positions in joule
                const userPositions = await getUserAllPositions(getWalletAddress());
                setUserPositions(userPositions);
                
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
    }, [isaptosAgentReady]);

    // Corrected return statement using shadcn UI card
    return (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Position</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Coin</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Interest</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userPositions?.[0]?.positions_map?.data?.map((position) => (
                            <>
                                {/* Lending Positions */}
                                {position.value.lend_positions.data.map((lendPosition) => (
                                    <TableRow key={`${position.key}-lend-${lendPosition.key}`}>
                                        <TableCell>{position.value.position_name}</TableCell>
                                        <TableCell>Lending</TableCell>
                                        <TableCell>{getTokenName(lendPosition.key.replace("@","0x"))}</TableCell>
                                        <TableCell>{lendPosition.value}</TableCell>
                                        <TableCell>-</TableCell>
                                    </TableRow>
                                ))}
                                {/* Borrowing Positions */}
                                {position.value.borrow_positions.data.map((borrowPosition) => (
                                    <TableRow key={`${position.key}-borrow-${borrowPosition.key}`}>
                                        <TableCell>{position.value.position_name}</TableCell>
                                        <TableCell>Borrowing</TableCell>
                                        <TableCell>{getTokenName(borrowPosition.value.coin_name.replace("@","0x"))}</TableCell>
                                        <TableCell>{borrowPosition.value.borrow_amount}</TableCell>
                                        <TableCell>{borrowPosition.value.interest_accumulated}</TableCell>
                                    </TableRow>
                                ))}
                            </>
                        ))}
                    </TableBody>
                </Table>
    );
}