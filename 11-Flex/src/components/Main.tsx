"use client";

import { useState } from "react";

// Aptos
import { useWallet, WalletContextState} from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network, Account, AccountAddress} from "@aptos-labs/ts-sdk"
// @ts-ignore
import { initHyperionSDK } from '@hyperionxyz/sdk'

// Main components
import { NewPortfolio } from "@/components/NewPortfolio";
import { UserPreferenceSlider } from "@/components/UserPreference";
import { Strategy } from "@/components/Strategy";


export let aptos: Aptos;
export let wallet:  WalletContextState;
export const sdk = initHyperionSDK({network: Network.MAINNET})

export function getWalletAddress(): AccountAddress {
  const walletAddress = wallet?.account?.address!
  return AccountAddress.fromString(walletAddress.toString())
}



export function Platform() {
  wallet = useWallet();

  const [apy, setApy] = useState(21.3);
  const [riskLimit, setRiskLimit] = useState("Medium");
      

  return (
    <div className="mx-auto flex space-x-10">
      <div id="Portfolio">
        <NewPortfolio />
        </div>

      <div className="flex-col space-y-10">
        <div id="UserPreference">
        <UserPreferenceSlider 
              apy={apy} 
              riskLimit={riskLimit}
              onApyChange={(value) => setApy(value)}
              onRiskChange={(value) => setRiskLimit(value)}
            />
        </div>

        <div id="Strategy">
        <Strategy />
        </div>

      </div>

    </div>
  );
}