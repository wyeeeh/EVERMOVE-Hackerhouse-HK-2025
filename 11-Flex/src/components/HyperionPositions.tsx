"use client"
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import {getWalletAddress, aptos, hyperionsdk, wallet} from "@/components/Main";
import { Hyperion_getallpool } from "@/entry-functions/hyperion";

import { get_hyperion_positions } from "@/utils/HyperionUtil";
interface AgentUIProps {
    isaptosAgentReady: boolean;
}

export function HyperionPositions({ isaptosAgentReady }: AgentUIProps) {
    useEffect(() => {
        if(!isaptosAgentReady) return
        async function fetchData() {
            try {
                await get_hyperion_positions();
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
    {isaptosAgentReady ? (
      <p>Agent is ready!</p>
    ) : (
      <p>Agent is not ready.</p>
    )}
  </div>;
}