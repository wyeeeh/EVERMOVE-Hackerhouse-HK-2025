"use client";

// Main Components
import { Header } from "@/components/Header";
import { Welcome } from '@/components/Welcome';
import { Platform } from "@/components/Main";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

function App() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen flex flex-col relative"> 
      <div id="Header" className="py-8 px-10">
        <Header connected={connected} />
      </div>
      
      <div id="MainPage" className="flex-1 flex flex-col container mx-auto ">
        {connected ? (
          <Platform />
        ) : (
          // Welcome Page to guide connect wallet
          <div className="flex-1 flex items-center justify-center">
            <Welcome />
          </div>
        )}
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-grid-pattern bg-repeat w-screen h-screen" />
    </div>
  );
}

export default App;
