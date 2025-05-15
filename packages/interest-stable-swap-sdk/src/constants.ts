import { normalizeSuiObjectId } from '@mysten/sui/utils';

import { OwnedObjects, Package } from './stable-swap.types';

export enum Modules {
  Pool = 'interest_stable_pool',
  Version = 'allowed_versions',
  Acl = 'acl',
  CoinDecimals = 'coin_decimals',
}

export const PACKAGES: Package = {
  STABLE_SWAP_DEX: {
    original: normalizeSuiObjectId(
      '0x50052aca3d7b971bd9824e1bb151748d03870adfe3ba06dce384d2a77297c719'
    ),
    latest: normalizeSuiObjectId(
      '0x50052aca3d7b971bd9824e1bb151748d03870adfe3ba06dce384d2a77297c719'
    ),
  },
} as const;

export const OWNED_OBJECTS: OwnedObjects = {
  PUBLISHER: normalizeSuiObjectId(
    '0xbd998dd45d0a575712f63b1c13c82a2e7152d1dc8d32cf81c838081eae9ebe52'
  ),
  SUPER_ADMIN: normalizeSuiObjectId(
    '0x97bd5896cf54f753ff8a684c1f89cff4d7ee4ee9015b022137db038ea07e6580'
  ),
  UPGRADE_CAP: normalizeSuiObjectId(
    '0x05e70cfa4b9b8f632efa5bd75cf0c26b222582b104198542c38e8c722ae20de9'
  ),
  ADMIN: normalizeSuiObjectId(
    '0xae46f0bcfce2c6e547a43317ce7421175fb2684d98e4e5029dd901c83eb97f31'
  ),
} as const;

export const SHARED_OBJECTS = {
  ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x608e6b201bc4733bd959b3e19427f3940c3c0a9b81d963ddd81af9a0823c6060'
    ),
    initialSharedVersion: '525079393',
    mutable,
  }),
  ALLOWED_VERSIONS: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x11257b3c039aed97d3c7dc5730dbf3779db15834717711a814f22c943a3ffbdc'
    ),
    initialSharedVersion: '525079393',
    mutable,
  }),
};

export const NEW_POOL_FN_MAP = {
  2: 'new_2_pool',
  3: 'new_3_pool',
  4: 'new_4_pool',
  5: 'new_5_pool',
} as Record<number, string>;

export const ADD_LIQUIDITY_FN_MAP = {
  2: 'add_liquidity_2_pool',
  3: 'add_liquidity_3_pool',
  4: 'add_liquidity_4_pool',
  5: 'add_liquidity_5_pool',
} as Record<number, string>;

export const REMOVE_LIQUIDITY_FN_MAP = {
  2: 'remove_liquidity_2_pool',
  3: 'remove_liquidity_3_pool',
  4: 'remove_liquidity_4_pool',
  5: 'remove_liquidity_5_pool',
} as Record<number, string>;

export const COIN_TYPES = {
  WAL_WWAL:
    '0xa21079e19909fb47fb8d2df32c8d38d8ccfa78fe14d10042b06a1a497eb1d5d4::ipx_stable_wal_wwal::IPX_STABLE_WAL_WWAL',
  WAL: '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
  WWAL: '0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf::wwal::WWAL',
};

export const POOLS = {
  WAL_WWAL: {
    lpCoinType: COIN_TYPES.WAL_WWAL,
    coinTypes: [COIN_TYPES.WAL, COIN_TYPES.WWAL],
    objectId: normalizeSuiObjectId(
      '0x2643f66613101148147ae5780eeb7471a0012de99daf40bb3a6030dc30a3561e'
    ),
    state: normalizeSuiObjectId(
      '0x2030dc777d15810aeb255ec2db3fe183eed46da3459d2635492b7339229ff595'
    ),
  },
};
