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
import {
  FarmsSDK,
  PACKAGES,
  OWNED_OBJECTS,
  FARMS,
} from '@interest-protocol/farms';

export const MANIFEST_TYPE =
  '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST';

const TEST_FARM_ID = FARMS[Network.MAINNET][MANIFEST_TYPE].objectId;

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
    manifestType: MANIFEST_TYPE,
  };
};
