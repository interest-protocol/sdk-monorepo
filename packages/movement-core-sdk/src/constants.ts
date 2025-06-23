import { AccountAddress } from '@aptos-labs/ts-sdk';

export enum Network {
  BARDOCK = 'bardock',
  MAINNET = 'mainnet',
  APTOS_TESTNET = 'aptos_testnet',
}

export const MAX_BPS = 10_000;

export const COIN_TYPES = {
  [Network.MAINNET]: {
    MOVE: '0x1::aptos_coin::AptosCoin',
  },
  [Network.BARDOCK]: {
    MOVE: '0x1::aptos_coin::AptosCoin',
  },
} as const;

export const COINS = {
  [Network.MAINNET]: {
    [COIN_TYPES[Network.MAINNET].MOVE]: {
      type: '0x1::aptos_coin::AptosCoin',
      symbol: 'MOVE',
      name: 'Move Coin',
      iconUri: '',
      decimals: 8,
    },
  },
  [Network.BARDOCK]: {
    [COIN_TYPES[Network.BARDOCK].MOVE]: {
      type: '0x1::aptos_coin::AptosCoin',
      symbol: 'MOVE',
      name: 'Move Coin',
      iconUri: '',
      decimals: 8,
    },
  },
} as const;

export const WHITELISTED_FAS = {
  MOVE: AccountAddress.from('0xa'),
  USDCe: AccountAddress.from(
    '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39'
  ),
  USDTe: AccountAddress.from(
    '0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d'
  ),
  WETHe: AccountAddress.from(
    '0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376'
  ),
  WBTCe: AccountAddress.from(
    '0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c'
  ),
};

export const FUNGIBLE_ASSETS_METADATA = {
  [WHITELISTED_FAS.MOVE.toString()]: {
    symbol: 'MOVE',
    name: 'Move Coin',
    address: WHITELISTED_FAS.MOVE,
    iconUri: '',
    decimals: 8,
  },
  [WHITELISTED_FAS.USDCe.toString()]: {
    symbol: 'USDC.e',
    name: 'USDC.e',
    address: WHITELISTED_FAS.USDCe,
    iconUri: '',
    decimals: 6,
  },
  [WHITELISTED_FAS.USDTe.toString()]: {
    symbol: 'USDT.e',
    name: 'USDT.e',
    address: WHITELISTED_FAS.USDTe,
    iconUri: '',
    decimals: 6,
  },
  [WHITELISTED_FAS.WETHe.toString()]: {
    symbol: 'WETH.e',
    name: 'WETH.e',
    address: WHITELISTED_FAS.WETHe,
    iconUri: '',
    decimals: 8,
  },
  [WHITELISTED_FAS.WBTCe.toString()]: {
    symbol: 'WBTC.e',
    name: 'WBTC.e',
    address: WHITELISTED_FAS.WBTCe,
    iconUri: '',
    decimals: 8,
  },
};
