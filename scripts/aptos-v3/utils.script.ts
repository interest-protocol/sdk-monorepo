import { Faucet, InterestV3 } from '@interest-protocol/aptos-v3';

export const interestV3 = new InterestV3();
export const faucet = new Faucet();

export const POW_10_8 = 10n ** 8n;

export const POW_10_6 = 10n ** 6n;

export const TEST_POOLS = {
  WETH_USDC:
    '0x3570c65d025f8df88173a44e79b2f1ef2104dac4f642f45eba90ea1804bb25b9',
};
