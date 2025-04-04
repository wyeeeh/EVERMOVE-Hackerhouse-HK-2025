import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Badge } from "@/components/ui/badge";

export function NetworkInfo() {
  const { network } = useWallet();
  
  return (
    <Badge variant="outline" className="w-24 text-md justify-center">
      {network?.name.toUpperCase() ?? "Network"}
    </Badge>
  );
}