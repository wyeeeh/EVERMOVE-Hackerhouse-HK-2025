"use client"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import {getWalletAddress} from "@/components/Main";
import { getUserDeposit, getUserLoan} from "@/utils/AriesUtil";

interface AgentUIProps {
    isaptosAgentReady: boolean;
}

export function AriesPositions({ isaptosAgentReady }: AgentUIProps) {
    const [Deposit, setDeposit] = useState();
    const [Loan, setLoan] = useState();
    

    useEffect(() => {
        if(!isaptosAgentReady) return
        async function fetchData() {
            try {
                //get now positions in joule
                const deposits = await getUserDeposit(getWalletAddress(), "USDC");
                const loans = await getUserLoan(getWalletAddress(), "APT")
            
                setDeposit(deposits);
                setLoan(loans);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [isaptosAgentReady]);

    // Corrected return statement using shadcn UI card
    return <div>
            <h1>Aries Position</h1>
            <p>USDC deposit: {Deposit} </p>
            <p>APT Loan: {Loan} </p>
          </div>
}