"use client";

import { NewHeader } from "@/components/NewHeader";
import { NewPortfolio } from "@/components/NewPortfolio";
import { NewStrategy } from "@/components/NewStrategy";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

function App() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      <NewHeader />
      
      {connected ? (
        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NewPortfolio />
            <NewStrategy />
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[80vh]">
          {/* <h1 className="text-2xl">Please connect your wallet</h1> */}
        </div>
      )}
    </div>
  );
}


// export App;

