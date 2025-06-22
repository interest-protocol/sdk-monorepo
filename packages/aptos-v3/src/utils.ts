import { Network } from '@aptos-labs/ts-sdk';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';

import { ConstructorArgs } from './dex.types';

export const getDefaultConstructorArgs = (): ConstructorArgs => {
  return {
    client: movementMainnetClient,
    network: Network.TESTNET,
  };
};
