import { Network } from '@interest-protocol/sui-core-sdk';
import {
  normalizeStructTag,
  normalizeSuiAddress,
  normalizeSuiObjectId,
  SUI_TYPE_ARG,
} from '@mysten/sui/utils';

export enum Modules {
  FARM = 'interest_farm',
}

export const PACKAGES = {
  [Network.TESTNET]: {
    INTEREST_FARM: {
      original: normalizeSuiAddress('0x0'),
      latest: normalizeSuiAddress('0x0'),
    },
  },
  [Network.MAINNET]: {
    INTEREST_FARM: {
      original: normalizeSuiAddress(
        '0x8e85bfe3139b0e4348f822cf30b6f21432af91bb74a019ba0a7dfc774c94f860'
      ),
      latest: normalizeSuiAddress(
        '0x8e85bfe3139b0e4348f822cf30b6f21432af91bb74a019ba0a7dfc774c94f860'
      ),
    },
  },
} as const;

export const OWNED_OBJECTS = {
  [Network.TESTNET]: {
    INTEREST_FARM_UPGRADE_CAP: normalizeSuiObjectId('0x0'),
  },
  [Network.MAINNET]: {
    INTEREST_FARM_UPGRADE_CAP: normalizeSuiObjectId(
      '0x73118d20ed16253acf3d181966f2953738193483f8268f520c1cd6e5120706c2'
    ),
  },
} as const;
