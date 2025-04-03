"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import { getWalletAddress} from "@/components/Main";
import {getUserAllPositions, getBalance, Amount2Shares, Joule_lendToken, Joule_withdrawToken, Joule_borrowToken, Joule_repayToken} from "@/components/JouleUtil"

interface AgentUIProps {
    isaptosAgentReady: boolean;
}

export function JouleAction({ isaptosAgentReady }: AgentUIProps) {
    const [balance, setBalance] = useState(Number);
    const [userPositions, setUserPositions] = useState();

    const [totalborrow, settotalborrow] = useState<number>(0);
    const [pborrow, setpborrow] = useState<string>("");
    const [totallend, settotallend] = useState<number>(0);
    const [plend, setplend] = useState<string>("");
    const [totalwithdraw, settotalwithdraw] = useState<number>(0);
    const [pwithdraw, setpwithdraw] = useState<string>("");
    const [totalrepay, settotalrepay] = useState<number>(0);
    const [prepay, setprepay] = useState<string>("");

    
    const MAINUSDC = "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
    const FAUSDC = "@bae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"

    const FAUSDT = "@bae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
    const MAINUSDT = "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b"
    
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
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [isaptosAgentReady]);

    const onClickButton_lend = async () => {
        if (!isaptosAgentReady) {
          return;
        }
        try {
            await Joule_lendToken(totallend * 1000000, MAINUSDC, plend, false, true)
        } catch (error) {
          console.error(error);
        }
      };
    const onClickButton_withdraw = async () => {
        if (!isaptosAgentReady) {
          return;
        }
        try {
            const shares = await Amount2Shares(totalwithdraw * 1000000, FAUSDC)
            await Joule_withdrawToken(shares, MAINUSDC, pwithdraw, true)
        } catch (error) {
          console.error(error);
        }
      };
    const onClickButton_borrow = async () => {
        if (!isaptosAgentReady) {
          return;
        }
        try {
            await Joule_borrowToken(totalborrow * 1000000, MAINUSDC, pborrow, true)
        } catch (error) {
          console.error(error);
        }
      };
    const onClickButton_repay = async () => {
        if (!isaptosAgentReady) {
          return;
        }
        try {
            await Joule_repayToken(totalrepay * 1000000, MAINUSDC, prepay, true)
        } catch (error) {
          console.error(error);
        }
      };
    // Corrected return statement using shadcn UI card
    console.log(userPositions)
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
            <Select value={plend} onValueChange={setplend} defaultValue={userPositions?.[0]?.positions_map?.data?.[0]?.key}>
              <SelectTrigger >
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {userPositions?.[0]?.positions_map?.data?.map((position) => (
                  <SelectItem key={position.key} value={position.key}>
                    {position.value.position_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onClickButton_lend}>
                Execute
            </Button>
            </div>
            

            <div className="flex items-center gap-2">
            <span>Withdraw</span>
            <Input
              type="number"
              value={totalwithdraw}
              onChange={(e) => settotalwithdraw(Number(e.target.value))}
              className="w-36"
            />
            <Select value={pwithdraw} onValueChange={setpwithdraw} defaultValue={userPositions?.[0]?.positions_map?.data?.[0]?.key}>
              <SelectTrigger >
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {userPositions?.[0]?.positions_map?.data?.map((position) => (
                  <SelectItem key={position.key} value={position.key}>
                    {position.value.position_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onClickButton_withdraw}>
                Execute
            </Button>
            </div>


            <div className="flex items-center gap-2">
            <span>Borrow</span>
            <Input
              type="number"
              value={totalborrow}
              onChange={(e) => settotalborrow(Number(e.target.value))}
              className="w-36"
            />
            <Select value={pborrow} onValueChange={setpborrow} defaultValue={userPositions?.[0]?.positions_map?.data?.[0]?.key}>
              <SelectTrigger >
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {userPositions?.[0]?.positions_map?.data?.map((position) => (
                  <SelectItem key={position.key} value={position.key}>
                    {position.value.position_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onClickButton_borrow}>
                Execute
            </Button>
            </div>
            

            <div className="flex items-center gap-2">
            <span>Repay</span>
            <Input
              type="number"
              value={totalrepay}
              onChange={(e) => settotalrepay(Number(e.target.value))}
              className="w-36"
            />
            <Select value={prepay} onValueChange={setprepay} defaultValue={userPositions?.[0]?.positions_map?.data?.[0]?.key}>
              <SelectTrigger >
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {userPositions?.[0]?.positions_map?.data?.map((position) => (
                  <SelectItem key={position.key} value={position.key}>
                    {position.value.position_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={onClickButton_repay}>
                Execute
            </Button>
            </div>
</div>
    );
}