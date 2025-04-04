import { useState } from 'react';
// Internal UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Aptos Components
import { AccountInfo } from "@/components/Archived/AccountInfo";
import { MessageBoard } from "@/components/Archived/MessageBoard";
import { NetworkInfo } from "@/components/NetworkInfo";
// import { TopBanner } from "@/components/TopBanner";
import { TransferAPT } from "@/components/Archived/TransferAPT";
import { WalletDetails } from "@/components/Archived/WalletDetails";


export function AccountDetails() {

  const [showDetails, setShowDetails] = useState(false);
//   const [callAIAgent, setcallAIAgent] = useState(false);

    return (
<Card>
    <CardContent className="pt-6">
        <div className="flex justify-center">
            <Button onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Hide Account Details" : "Show Account Details"}
            </Button>
        </div>
        {showDetails && (
            <div>
                {/* <MerkleTrade /> */}
                <WalletDetails />
                <NetworkInfo />
                <AccountInfo />
                <TransferAPT />
                <MessageBoard />
            </div>
        )}
    </CardContent>
</Card>
    )};