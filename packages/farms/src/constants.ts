import { Network } from '@interest-protocol/sui-core-sdk';
import { normalizeSuiAddress, normalizeSuiObjectId } from '@mysten/sui/utils';

export enum Modules {
  FARM = 'interest_farm',
  FARM_UTILS = 'farm_utils',
}

export const PACKAGES = {
  [Network.TESTNET]: {
    INTEREST_FARM: {
      original: normalizeSuiAddress(
        '0xa2d93c37125d5be0ab67614d79ce7faad31fa96e07088108578b2f9912987d73'
      ),
      latest: normalizeSuiAddress(
        '0xa2d93c37125d5be0ab67614d79ce7faad31fa96e07088108578b2f9912987d73'
      ),
    },
    INTEREST_FARM_UTILS: {
      original: normalizeSuiAddress('0x0'),
      latest: normalizeSuiAddress('0x0'),
    },
  },
  [Network.MAINNET]: {
    INTEREST_FARM: {
      original: normalizeSuiAddress(
        '0xb554009beec31a2000ef31e38ca5ac3a248a4f0c9df131f35f9c0e4cf9745f88'
      ),
      latest: normalizeSuiAddress(
        '0xb554009beec31a2000ef31e38ca5ac3a248a4f0c9df131f35f9c0e4cf9745f88'
      ),
    },
    INTEREST_FARM_UTILS: {
      original: normalizeSuiAddress(
        '0x938206cfaf61ac880aea76a6c82c75db07f4fdcc6d1391a88eeda6dfef10acbf'
      ),
      latest: normalizeSuiAddress(
        '0x938206cfaf61ac880aea76a6c82c75db07f4fdcc6d1391a88eeda6dfef10acbf'
      ),
    },
  },
} as const;

export const OWNED_OBJECTS = {
  [Network.TESTNET]: {
    INTEREST_FARM_UPGRADE_CAP: normalizeSuiObjectId(
      '0x4136cf73c9ce2491a16a7b52c1c98f493f9847870a4148bde201977ada0185f3'
    ),
    INTEREST_FARM_UTILS_UPGRADE_CAP: normalizeSuiObjectId('0x0'),
  },
  [Network.MAINNET]: {
    INTEREST_FARM_UPGRADE_CAP: normalizeSuiObjectId(
      '0x438fdb7f5b22cb33b331a3fd5fd6db2db1b4d329664b76328c36c737c0c559b0'
    ),
    INTEREST_FARM_UTILS_UPGRADE_CAP: normalizeSuiObjectId(
      '0x3cc5bf67068d41fe92084711679e2bb809ec99a6737c64496cf2d4a607c9255f'
    ),
  },
} as const;

export const FARMS = {
  [Network.TESTNET]: {
    '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST':
      {
        stakeCoinType:
          '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST',
        objectId: normalizeSuiObjectId(
          '0x498664a6956303915a4f40be57e3c43db58e913bec497e6d86e2da8e26200910'
        ),
        initialSharedVersion: '667687710',
      },
    '0x9d5ddbd962c19eb4b7aeb22f82e9b0925c066b7fbc5cc7254051b7b2ffd01f8d::odor::ODOR':
      {
        stakeCoinType: '0x0',
        objectId: normalizeSuiObjectId('0x0'),
        initialSharedVersion: '0',
      },
    '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA':
      {
        stakeCoinType: '0x0',
        objectId: normalizeSuiObjectId('0x0'),
        initialSharedVersion: '0',
      },
  },
  [Network.MAINNET]: {
    '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST':
      {
        stakeCoinType:
          '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST',
        objectId: normalizeSuiObjectId(
          '0xb8cdf04f2d3ecde5b66f99d1005ad31e5bb915d689c1d6c09dc7d43addbc884d'
        ),
        initialSharedVersion: '667687712',
      },
    '0x9d5ddbd962c19eb4b7aeb22f82e9b0925c066b7fbc5cc7254051b7b2ffd01f8d::odor::ODOR':
      {
        stakeCoinType:
          '0x9d5ddbd962c19eb4b7aeb22f82e9b0925c066b7fbc5cc7254051b7b2ffd01f8d::odor::ODOR',
        objectId: normalizeSuiObjectId(
          '0xd4cfcfbb6e10b645ceec744719b8e01b5d7d9c1a1f6d8cde8f6f8d725f896b24'
        ),
        initialSharedVersion: '676841630',
      },
    '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA':
      {
        stakeCoinType:
          '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA',
        objectId: normalizeSuiObjectId(
          '0xc6721721e6b66f05ab4374257974d8c0f1beef0db089c30bcfb721f0a6874c46'
        ),
        initialSharedVersion: '682067293',
      },
  },
};
