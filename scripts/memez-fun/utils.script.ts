import {
  CONFIG_KEYS,
  ConfigSDK,
  makeMemezAclSdk,
  MemezPumpSDK,
  MemezStableSDK,
  MIGRATOR_WITNESSES,
  OWNED_OBJECTS,
  PACKAGES,
  RecrdMigratorSDK,
  SHARED_OBJECTS,
  TestMigratorSDK,
  TYPES,
} from '@interest-protocol/memez-fun-sdk';
import { Network } from '@interest-protocol/sui-core-sdk';
import { executeTx, keypair, suiClient } from '@interest-protocol/sui-utils';
import { getFullnodeUrl } from '@mysten/sui/client';

const TEST_POOL_ID =
  '0xbc0fb2558938521434dd528427e9585c420af83b44277b325fe8a2987c897b15';

const TEST_STABLE_POOL_ID =
  '0xf53fd73af2d033c1c8d82a385ce983b6d24d0c722cf564317d85fbecdeb833b0';

const recrdMigratorSdk = new RecrdMigratorSDK();

export const getEnv = async () => {
  const network =
    process.env.WEB_3_NETWORK === 'mainnet' ? Network.MAINNET : Network.TESTNET;

  const payload = {
    network,
    fullNodeUrl: getFullnodeUrl(network),
  };

  return {
    aclSdk: makeMemezAclSdk(payload),
    configSdk: new ConfigSDK(payload),
    pumpSdk: new MemezPumpSDK(payload),
    stableSdk: new MemezStableSDK(payload),
    testMigratorSdk: new TestMigratorSDK(payload),
    suiClient,
    executeTx,
    network,
    migratorWitnesses: MIGRATOR_WITNESSES[network],
    ownedObjects: OWNED_OBJECTS[network],
    sharedObjects: SHARED_OBJECTS[network],
    types: TYPES[network],
    configKeys: CONFIG_KEYS[network],
    packages: PACKAGES[network],
    keypair,
    testnetStablePoolId: TEST_STABLE_POOL_ID,
    testnetPoolId: TEST_POOL_ID,
    recrdMigratorSdk,
    POW_10_9: 10n ** 9n,
  };
};
