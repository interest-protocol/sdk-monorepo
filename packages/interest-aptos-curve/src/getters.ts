import { MoveResource } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

import { TYPES } from './constants';

export const findPairedCoinType = (resources: MoveResource[]) =>
  resources.find(
    (resource) => resource.type === TYPES[Network.MAINNET].PAIRED_COIN_TYPE
  ) || null;

export const findConcurrentSupply = (resources: MoveResource[]) =>
  resources.find(
    (resource) => resource.type === TYPES[Network.MAINNET].CONCURRENT_SUPPLY
  ) || null;

export const findFaMetadata = (resources: MoveResource[]) =>
  resources.find(
    (resource) => resource.type === TYPES[Network.MAINNET].FA_METADATA
  ) || null;

export const findObjectCore = (resources: MoveResource[]) =>
  resources.find(
    (resource) => resource.type === TYPES[Network.MAINNET].OBJECT_CORE
  ) || null;
