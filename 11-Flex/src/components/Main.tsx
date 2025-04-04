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
  const [riskLimit, setRiskLimit] = useState("medium");      
  const [isaptosAgentReady, setIsaptosAgentReady] = useState<boolean>(false);
  const [ishyperionsdkReady, setIshyperionsdkReady] = useState<boolean>(false);

  useEffect(() => {
    const initAptosAgent = async() => {
      const aptosConfig = new AptosConfig({
        network: Network.MAINNET,
        fullnode: "https://fullnode.mainnet.aptoslabs.com/v1",
      });
      aptos = new Aptos(aptosConfig);
      setIsaptosAgentReady(true);
    };
    const initHyperion = async() => {
      hyperionsdk = initHyperionSDK({network: Network.MAINNET})
      setIshyperionsdkReady(true)
    }
    initAptosAgent();
    initHyperion();
  }, []);


  return (
    <div className="flex space-x-20 justify-center">
      <div className="w-1/2" id="Portfolio">
        <NewPortfolio isaptosAgentReady={isaptosAgentReady} ishyperionsdkReady={ishyperionsdkReady}/>
        </div>

      <div className="w-1/2 flex-col space-y-10" id="rightCol">
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