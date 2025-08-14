import {
  CONFIG_KEYS,
  ConfigSDK,
  makeMemezAclSdk,
  MemezPumpSDK,
  MIGRATOR_WITNESSES,
  OWNED_OBJECTS,
  PACKAGES,
  SHARED_OBJECTS,
  TYPES,
  XPumpMigratorSDK,
} from '@interest-protocol/memez-fun-sdk';
import { Network } from '@interest-protocol/sui-core-sdk';
import { executeTx, keypair, suiClient } from '@interest-protocol/sui-utils';
import { getFullnodeUrl } from '@mysten/sui/client';

const TEST_POOL_ID =
  '0x7f2942e00a835d4873efaff220927cd51438a658260a3ddd064af74f87761478';

const xPumpMigratorSdk = new XPumpMigratorSDK();

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
    testnetPoolId: TEST_POOL_ID,
    xPumpMigratorSdk,
    POW_10_9: 10n ** 9n,
  };
};
