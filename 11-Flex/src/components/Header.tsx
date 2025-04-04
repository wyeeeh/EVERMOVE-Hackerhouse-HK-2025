// import ui components
import { ModeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from "next-themes";


// import Aptos Wallet Selector
import { WalletSelector } from "./WalletSelector";
import { NetworkInfo } from "@/components/NetworkInfo";


export function Header({ connected }: { connected: boolean }) {
  // 使用useTheme钩子来获取当前主题
  const { theme, systemTheme } = useTheme();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <img 
          src={
            theme === 'system' 
              ? (systemTheme === 'dark' ? "/logo/flexfinance-logotype-white.svg" : "/logo/flexfinance-logotype-dark.svg")
              : (theme === 'dark' ? "/logo/flexfinance-logotype-white.svg" : "/logo/flexfinance-logotype-dark.svg")
          } 
          alt="Logo" 
          className="h-10" 
        />
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <WalletSelector />
        <NetworkInfo />
      </div>
    </div>
  );
}