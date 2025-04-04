"use client"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import {getWalletAddress, aptos, sdk} from "@/components/Main";
import {getUserAllPositions, getBalance} from "@/utils/JouleUtil"

interface AgentUIProps {
    isaptosAgentReady: boolean;
}

async function getAptMetadata() {
    try {
      // APT 的 Metadata 地址通常是固定的，可以通过 0x1 的资源查询
      const aptMetadataAddress = "0xa"; // APT 的 FA Metadata 地址（主网）
      const metadata = await aptos.getAccountResource({
        accountAddress: aptMetadataAddress,
        resourceType: "0x1::fungible_asset::Metadata",
      });
      console.log("APT Metadata:", metadata);
      return metadata;
    } catch (error) {
        throw new Error(`Error fetching Metadata: ${error}`);
    }
}

async function getUsdcMetadata() {
    try {
      const metadata = await aptos.getAccountResource({
        accountAddress: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
        resourceType: "0x1::fungible_asset::Metadata",
      });
      console.log("USDC Metadata:", metadata);
      return metadata;
    } catch (error) {
      throw new Error(`Error fetching Metadata: ${error}`);
    }
}

// async function getexample() {
//     const poolItems = await sdk.Pool.fetchAllPools();
//     console.log(poolItems)
// }
  

export function HyperionPositions({ isaptosAgentReady }: AgentUIProps) {
    useEffect(() => {
        if(!isaptosAgentReady) return
        async function fetchData() {
            try {
                await getAptMetadata();
                await getUsdcMetadata();
                //await getexample();
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