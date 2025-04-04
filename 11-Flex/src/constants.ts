import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network = (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "mainnet";
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;

export const coin_address = {
    APT: "0xa",
    USDC: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    USDT: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
} as const;


export const coin_address_map: Record<string, string>  = {
    "APT": "0x1::aptos_coin::AptosCoin",
    "USDC": "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    "USDT": "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
} as const;

export const coin_is_fungible: Record<string, boolean>  = {
    "APT": false,
    "USDC": true,
    "USDT": true,
} as const;


export const coin_type = {
    APT: "0x1::aptos_coin::AptosCoin",
    USDC: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    USDT: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
} as const;

export const coin_decimals = {
    APT: 8,
    USDC: 6,
    USDT: 6,
} as const;

