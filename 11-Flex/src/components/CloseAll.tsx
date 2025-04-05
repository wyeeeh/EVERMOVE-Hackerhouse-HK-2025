"use client"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { create_hyperion_positions } from "@/utils/HyperionUtil";
import { Joule_repayToken, Joule_withdrawToken, getUserAllPositions, Amount2Shares} from "@/utils/JouleUtil";
import { getWalletAddress } from "@/components/Main";
import { getAllPostion, Aries_repayToken, Aries_withdrawToken, Aries_decimal } from "@/utils/AriesUtil";
import { coin_decimals_map } from "@/constants";
import { get_hyperion_positions } from "@/utils/HyperionUtil";
import { close_all_hyperion_positions } from "@/utils/HyperionUtil";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CloseAll() {
    const onClickButton = async () => {
        try {
            //close joule:
            const nowpos = await getUserAllPositions(getWalletAddress());
            console.log(nowpos)
            for (const [index, borrowPosition] of nowpos?.value?.borrow_positions?.data.entries()) {
                const amount = borrowPosition.value.borrow_amount;
                console.log(borrowPosition.key, amount);
                if(amount > 2000) {
                    const coin = borrowPosition.key.replace("@", "0x")
                   await Joule_repayToken(amount, coin, "2", !coin.includes("aptos"))
                }
            };
            await sleep(500)
            for (const [index, lendPosition] of nowpos?.value?.lend_positions?.data.entries()) {
                const amount = lendPosition.value;
                console.log(lendPosition.key, amount);
                if(amount > 2000) {
                    const shares = await Amount2Shares(amount-1000, lendPosition.key)       
                    const coin = lendPosition.key.replace("@", "0x")
                    await Joule_withdrawToken(shares, coin, "2", !coin.includes("aptos"))
                }
            };
            await sleep(500)
            //close Aries:
            const nowaries = await getAllPostion(getWalletAddress())
            for (const [index, position] of nowaries.entries()) {
                const { coin, lend, borrow } = position;
                console.log(`Close position ${index}: ${coin}, lend: ${lend}, borrow: ${borrow}`);
                if(borrow > 0.001) {
                    const exeborrow = Math.floor(borrow*Math.pow(10,coin_decimals_map[coin]))
                    await Aries_repayToken(BigInt(Math.floor(exeborrow)), coin)
                }
            };
            await sleep(500)
            for (const [index, position] of nowaries.entries()) {
                const { coin, lend, borrow } = position;
                console.log(`Close position ${index}: ${coin}, lend: ${lend}, borrow: ${borrow}`);
                if(lend > 0.001) {
                    const exelend = Math.floor(lend*Math.pow(10,coin_decimals_map[coin]))
                    await Aries_withdrawToken(BigInt(Math.floor(exelend)), coin)
                }
            }
            await sleep(500)
            //close hyprion:
            await close_all_hyperion_positions();
        } catch (error) {
          console.error(error);
        }
      };

    return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
            <Button onClick={onClickButton}>
                Close All
            </Button>
            </div>  
        </div>
    );
}