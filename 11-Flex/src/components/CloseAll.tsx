"use client"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { create_hyperion_positions } from "@/utils/HyperionUtil";
import { Joule_repayToken, Joule_withdrawToken, getUserAllPositions, Amount2Shares} from "@/utils/JouleUtil";
import { getWalletAddress } from "@/components/Main";

export function CloseAll() {
    const onClickButton = async () => {
        try {
            //close joule:
            const nowpos = await getUserAllPositions(getWalletAddress());
            console.log(nowpos)
            for (const [index, borrowPosition] of nowpos?.value?.borrow_positions?.data.entries()) {
                const amount = borrowPosition.value.borrow_amount;
                console.log(borrowPosition.key, amount);
                if(amount > 1000) {
                    const coin = borrowPosition.key.replace("@", "0x")
                   await Joule_repayToken(amount, coin, "2", !coin.includes("aptos"))
                }
            };
            for (const [index, lendPosition] of nowpos?.value?.lend_positions?.data.entries()) {
                const amount = lendPosition.value;
                console.log(lendPosition.key, amount);
                if(amount > 1000) {
                    const shares = await Amount2Shares(amount-1000, lendPosition.key)       
                    const coin = lendPosition.key.replace("@", "0x")
                    await Joule_withdrawToken(shares, coin, "2", !coin.includes("aptos"))
                }
            };
            //close Aries:
        } catch (error) {
          console.error(error);
        }
      };

    return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
            <span>Close All Position</span>
            <Button onClick={onClickButton}>
                Execute
            </Button>
            </div>  
        </div>
    );
}