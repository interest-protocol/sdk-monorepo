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
  '0xa1978573eef42691c4357e8c97de4edb2608257d1e936532d403654ceb4f17be';

export const UPGRADE_CAP =
  '0x5fc63d276439162bace28cf77fdb777eb9a8816d13d7dfa9ee40f967665b7622';

export const ADMIN_CAP =
  '0x20b8909fcad08fa7d2b13d3a974d6b869eebcd110d9dbddcd975c2a8401a5897';

const TEN_CENT_SUI_POOL = {
  objectId:
    '0x4424e9d1d5f23d8b96dbdc0dbc8da67164676dd4e57a25966f3b6eaec32d23d2',
  version: '6',
};

const ONE_SUI_POOL = {
  objectId: '',
  version: '',
};

const TEN_SUI_POOL = {
  objectId: '',
  version: '',
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
    PACKAGE_ID,
  };
};
