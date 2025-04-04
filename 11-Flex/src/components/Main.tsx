"use client";

import { useState, useEffect} from "react";

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
export let hyperionsdk: any; 

export function getWalletAddress(): AccountAddress {
  const walletAddress = wallet?.account?.address!
  return AccountAddress.fromString(walletAddress.toString())
}



export function Platform() {
  // Merkle客户端就绪状态
  wallet = useWallet();

  const [apy, setApy] = useState(21.3);
  const [riskLimit, setRiskLimit] = useState("Medium");
      
  useEffect(() => {
    const initAptosAgent = async() => {
      const aptosConfig = new AptosConfig({
        network: Network.MAINNET,
        fullnode: "https://fullnode.mainnet.aptoslabs.com/v1",
      });
      aptos = new Aptos(aptosConfig);
    };
    const initHyperion = async() => {
      hyperionsdk = initHyperionSDK({network: Network.MAINNET})
    }
    initAptosAgent();
    initHyperion();
  }, []);


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