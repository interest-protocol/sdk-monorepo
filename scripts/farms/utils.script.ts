import {
  makeMemezAclSdk,
  OWNED_OBJECTS as MemezOwnedObjects,
  TYPES as MemezTypes,
} from '@interest-protocol/memez-fun-sdk';
import { Network } from '@interest-protocol/sui-core-sdk';
import {
  executeTx,
  keypair,
  suiClient,
  devInspectTransactionBlock,
} from '@interest-protocol/sui-utils';
import { getFullnodeUrl } from '@mysten/sui/client';
import { FarmsSDK, PACKAGES, OWNED_OBJECTS } from '@interest-protocol/farms';

const TEST_FARM_ID =
  '0xe18603192330eb80be38041eeedf7f7c821f0d75dc3a829c8b247fbd54a319f8';

export const FAKE_SUI_TYPE_ARG =
  '0xfd35b96db6d0eb23b8dc4eae97d330d8de85d36ee6a9ab0b35dcb2b7b86cd22a::fake_sui::FAKE_SUI';

const POW_9 = 10n ** 9n;

export const getEnv = async () => {
  const network =
    process.env.WEB_3_NETWORK === 'mainnet' ? Network.MAINNET : Network.TESTNET;

  const payload = {
    network,
    fullNodeUrl: getFullnodeUrl(network),
  };

  const farmsSdk = new FarmsSDK(payload);

  return {
    aclSdk: makeMemezAclSdk(payload),
    memezOwnedObjects: MemezOwnedObjects[network],
    memezTypes: MemezTypes[network],
    farmsSdk,
    suiClient,
    executeTx,
    network,
    ownedObjects: OWNED_OBJECTS[network],
    packages: PACKAGES[network],
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
    fakeSuiTypeArg: FAKE_SUI_TYPE_ARG,
    pow9: POW_9,
    farmId: TEST_FARM_ID,
  };
};
