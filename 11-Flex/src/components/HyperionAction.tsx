"use client"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { create_hyperion_positions } from "@/utils/HyperionUtil";
interface AgentUIProps {
    ishyperionsdkReady: boolean;
}

export function HyperionAction({ ishyperionsdkReady }: AgentUIProps) {
    const onClickButton_createposition = async () => {
        if (!ishyperionsdkReady) {
          return;
        }
        try {
            await create_hyperion_positions(10000000, 4.5, 6)
        } catch (error) {
          console.error(error);
        }
      };

    return (
          <div className="space-y-2">
                {/* <div>Transfer Result: {JSON.stringify(result)}</div> */}
                {/* <div>Balance: {balance}</div> */}
                {/* <div>Transaction Info: {JSON.stringify(txInfo)}</div> */}
            <div className="flex items-center gap-2">
            <span>open position</span>
            <Button onClick={onClickButton_createposition}>
                Execute
            </Button>
            </div>  
        </div>
    );
}