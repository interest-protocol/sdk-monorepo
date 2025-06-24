import { Faucet, InterestV3 } from '@interest-protocol/aptos-v3';
import {
  bardockClient,
  MOVEMENT_BARDOCK_INDEXER_URL,
  Network,
} from '@interest-protocol/movement-core-sdk';
import { GraphQLClient } from 'graphql-request';

export const interestV3 = new InterestV3({
  network: Network.BARDOCK,
  client: bardockClient,
});
export const faucet = new Faucet();

export const POW_10_8 = 10n ** 8n;

export const POW_10_6 = 10n ** 6n;

export const TEST_POOLS = {
  [Network.BARDOCK]: {
    WETH_USDC:
      '0xc762a63e9ba30f1b59893b463bd9dfaea336806644b0cdca77c44d0b6f2f720f',
  },
  [Network.APTOS_TESTNET]: {
    WETH_USDC:
      '0x58645946db3e0b647535dcc14850e1051ca0fbc246496a8ae793914c64d1c1f8',
  },
};

export const bardockGraphQLClient = new GraphQLClient(
  MOVEMENT_BARDOCK_INDEXER_URL
);
