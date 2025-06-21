import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

export const MOVEMENT_MAINNET_RPC_URL =
  'https://mainnet.movementnetwork.xyz/v1';
export const MOVEMENT_MAINNET_INDEXER_URL =
  'https://indexer.mainnet.movementnetwork.xyz/v1/graphql';

export const MOVEMENT_BARDOCK_RPC_URL =
  'https://aptos.testnet.bardock.movementlabs.xyz/v1';

export const MOVEMENT_BARDOCK_INDEXER_URL =
  'https://indexer.testnet.movementnetwork.xyz';

export const movementMainnetClient = new Aptos(
  new AptosConfig({
    fullnode: MOVEMENT_MAINNET_RPC_URL,
    network: Network.CUSTOM,
    indexer: MOVEMENT_MAINNET_INDEXER_URL,
  })
);

export const bardockClient = new Aptos(
  new AptosConfig({
    fullnode: MOVEMENT_BARDOCK_RPC_URL,
    network: Network.CUSTOM,
    indexer: MOVEMENT_BARDOCK_INDEXER_URL,
  })
);

export const aptosTestnetClient = new Aptos(
  new AptosConfig({
    network: Network.TESTNET,
  })
);
