import { VortexAdminSdk, VortexSdk, Pool } from '@interest-protocol/vortex-sdk';
import { Network } from '@interest-protocol/sui-core-sdk';
import {
  executeTx,
  keypair,
  devnetSuiClient,
  devInspectTransactionBlock,
} from '@interest-protocol/sui-utils';
import { getFullnodeUrl } from '@mysten/sui/client';

const PACKAGE_ID =
  '0xa97cb2c87ae326435cb30660c190b65862d43b6ce3cfa100deb00699a812cf81';

export const UPGRADE_CAP =
  '0x2da92c81c9f90442fa2063ae9d34c80e7d3009095fd0eb41b0622dea16af559b';

export const ADMIN_CAP =
  '0x3d34e6b2fb508de4a31b79bb37db024b561cb7899f479d8edf616e98b7d2cde7';

const TEN_CENT_SUI_POOL = {
  objectId:
    '0x2849d993a87e55fb361a27cfe19f6cc1e1dbfbddc7d9bedbf2b396fce3245c2f',
  version: '8',
};

const ONE_SUI_POOL = {
  objectId:
    '0xac547d19cc7a1fe7c15584a0c0c6d366d73cf83cfec532e0248d5b009e99bd1f',
  version: '8',
};

const TEN_SUI_POOL = {
  objectId:
    '0x363436ca0ac0d13c02008bf56b6ea509e424a7b5b65463e0350c1ac7108bd61f',
  version: '8',
};

const POOLS = {
  [Pool.whale]: {
    objectId: TEN_SUI_POOL.objectId,
    initialSharedVersion: TEN_SUI_POOL.version,
  },
  [Pool.dolphin]: {
    objectId: ONE_SUI_POOL.objectId,
    initialSharedVersion: ONE_SUI_POOL.version,
  },
  [Pool.shrimp]: {
    objectId: TEN_CENT_SUI_POOL.objectId,
    initialSharedVersion: TEN_CENT_SUI_POOL.version,
  },
};

export const getEnv = async () => {
  const network =
    process.env.WEB_3_NETWORK === 'mainnet' ? Network.MAINNET : Network.TESTNET;

  const payload = {
    network,
    fullNodeUrl: getFullnodeUrl(network),
  };

  return {
    adminSdk: new VortexAdminSdk({
      packageId: PACKAGE_ID,
      adminCap: ADMIN_CAP,
    }),
    vortexSdk: new VortexSdk({
      packageId: PACKAGE_ID,
      client: devnetSuiClient,
      pools: POOLS,
    }),
    suiClient: devnetSuiClient,
    executeTx,
    network,
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
    pools: POOLS,
  };
};
