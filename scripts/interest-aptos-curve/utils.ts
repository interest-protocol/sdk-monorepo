import { AccountAddress } from '@aptos-labs/ts-sdk';
import { InterestCurve } from '@interest-protocol/interest-aptos-curve';
import { Network, WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';

export const COINS = {
  [Network.MAINNET]: {
    MOVE: '0x1::aptos_coin::AptosCoin',
  },
  [Network.BARDOCK]: {
    MOVE: '0x1::aptos_coin::AptosCoin',
  },
};

export const TEST_MAINNET_FA_ADDRESSES = {
  TEST: AccountAddress.from(
    '0xa9e24310872baa7625891b9aa7e698d3140fef5faaa933b65c3ff8216a364598'
  ),
  TEST123: AccountAddress.from(
    '0xa8ba601f7af42c34d2cd2feee9d41e62160dcd77dd07a9e2308dff07b2a258e1'
  ),
};

export const FA_ADDRESSES = {
  [Network.MAINNET]: {
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
    FIRE: AccountAddress.from(
      '0x5f7f59e38a96dfe79830f53fe49a19e770f70a13ff30ce598a49e8f0a2b46861'
    ),
  },
  [Network.BARDOCK]: {
    MOVE: AccountAddress.from('0xa'),
    TEST: AccountAddress.from(
      '0xa9e24310872baa7625891b9aa7e698d3140fef5faaa933b65c3ff8216a364598'
    ),
  },
} as const;

export const TEST_MAINNET_TEST_POOLS = {
  [Network.MAINNET]: [
    {
      isStable: false,
      address: AccountAddress.from(
        '0x486cc5aacea27797e8f47971ac5b0bc301d1aafd9b5510811360a7d28768ad39'
      ),
      name: 'MOVE-TEST123',
      fas: [WHITELISTED_FAS.MOVE, TEST_MAINNET_FA_ADDRESSES.TEST],
    },
  ],
};

export const POW_8 = 100_000_000;
export const POW_8BN = BigInt(POW_8);

export const POW_6 = 1_000_000;
export const POW_6BN = BigInt(POW_6);

export const TREASURY_ADDRESS = AccountAddress.from(
  '0xba515545b9681def6f170b6a3a533368c3404f2a91e8842150d08ba377aabd34'
);

export const curveMainnetSDK = new InterestCurve({
  network: Network.MAINNET,
});
