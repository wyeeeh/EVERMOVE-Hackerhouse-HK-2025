"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { Aries_lendToken, Aries_borrowToken} from "@/utils/AriesUtil";
interface AgentUIProps {
    isaptosAgentReady: boolean;
}

export function AriesAction({ isaptosAgentReady }: AgentUIProps) {
    
    const [totalborrow, settotalborrow] = useState<number>(0);
    const [totallend, settotallend] = useState<number>(0);
    const [totalwithdraw, settotalwithdraw] = useState<number>(0);
    const [totalrepay, settotalrepay] = useState<number>(0);
    
    const onClickButton_lend = async () => {
        if (!isaptosAgentReady) {
          return;
        }
        try {
            await Aries_lendToken(BigInt(Math.floor(totallend * 1000000)), "USDC")
        } catch (error) {
          console.error(error);
        }
      };
    // const onClickButton_withdraw = async () => {
    //     if (!isaptosAgentReady) {
    //       return;
    //     }
    //     try {
    //         const shares = await Amount2Shares(totalwithdraw * 1000000, FAUSDC)
    //         await Joule_withdrawToken(shares, MAINUSDC, pwithdraw, true)
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   };
    const onClickButton_borrow = async () => {
        if (!isaptosAgentReady) {
          return;
        }
        try {
            await Aries_borrowToken(BigInt(Math.floor(totalborrow * 100000000)), "APT")
        } catch (error) {
          console.error(error);
        }
    };
    // const onClickButton_repay = async () => {
    //     if (!isaptosAgentReady) {
    //       return;
    //     }
    //     try {
    //         await Joule_repayToken(totalrepay * 1000000, MAINUSDC, prepay, true)
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   };
    // Corrected return statement using shadcn UI card
    return (
          <div className="space-y-2">
                {/* <div>Transfer Result: {JSON.stringify(result)}</div> */}
                {/* <div>Balance: {balance}</div> */}
                {/* <div>Transaction Info: {JSON.stringify(txInfo)}</div> */}
            <div className="flex items-center gap-2">
            <span>Lend</span>
            <Input
              type="number"
              value={totallend}
              onChange={(e) => settotallend(Number(e.target.value))}
              className="w-36"
            />
            <Button onClick={onClickButton_lend}>
                Execute
            </Button>
            </div>
            

            {/* <div className="flex items-center gap-2">
            <span>Withdraw</span>
            <Input
              type="number"
              value={totalwithdraw}
              onChange={(e) => settotalwithdraw(Number(e.target.value))}
              className="w-36"
            />
            <Button onClick={onClickButton_withdraw}>
                Execute
            </Button>
            </div> */}


            <div className="flex items-center gap-2">
            <span>Borrow</span>
            <Input
              type="number"
              value={totalborrow}
              onChange={(e) => settotalborrow(Number(e.target.value))}
              className="w-36"
            />
            <Button onClick={onClickButton_borrow}>
                Execute
            </Button>
            </div>
            

            {/* <div className="flex items-center gap-2">
            <span>Repay</span>
            <Input
              type="number"
              value={totalrepay}
              onChange={(e) => settotalrepay(Number(e.target.value))}
              className="w-36"
            />
            <Button onClick={onClickButton_repay}>
                Execute
            </Button>
            </div> */}
</div>
    );
}