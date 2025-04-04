"use client";

import { NETWORK } from "@/constants";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function WrongNetworkAlert() {
  const { network, connected } = useWallet();

  return !connected || network?.name === NETWORK ? (
    <></>
  ) : (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wrong Network</AlertDialogTitle>
          <AlertDialogDescription>
          Your current network is <span className="font-bold">{network?.name?.toUpperCase()}</span>. Please switch to <span className="font-bold">{NETWORK.toUpperCase()}</span> to continue using the app.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Switch Network</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
