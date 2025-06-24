import { Faucet, InterestV3 } from '@interest-protocol/aptos-v3';
import {
  aptosTestnetClient,
  Network,
} from '@interest-protocol/movement-core-sdk';

export const interestV3 = new InterestV3({
  network: Network.APTOS_TESTNET,
  client: aptosTestnetClient,
});
export const faucet = new Faucet();

export const POW_10_8 = 10n ** 8n;

export const POW_10_6 = 10n ** 6n;

export const TEST_POOLS = {
  [Network.BARDOCK]: {
    WETH_USDC:
      '0xbd3946d2757076d5b1643fee8e1f0f8c0d7c0386c9c9afb897d4db5020d5b757',
  },
  [Network.APTOS_TESTNET]: {
    WETH_USDC:
      '0x58645946db3e0b647535dcc14850e1051ca0fbc246496a8ae793914c64d1c1f8',
  },
};
