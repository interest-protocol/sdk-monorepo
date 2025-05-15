import { hasValueOrThrow } from '@interest-protocol/sui-core-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeStructTag } from '@mysten/sui/utils';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import { PACKAGES, SHARED_OBJECTS } from './constants';
import { PoolMetadataValue, SdkConstructorArgs } from './stable-swap.types';

export const getSdkDefaultArgs = (): SdkConstructorArgs => ({
  packages: PACKAGES,
  fullNodeUrl: getFullnodeUrl('mainnet'),
  sharedObjects: SHARED_OBJECTS,
});

export const parsePoolObject = (poolObj: SuiObjectResponse) => {
  invariant(poolObj.data, 'Pool object data not found');
  invariant(poolObj.data.type, 'Pool object type not found');

  const lpCoinType = hasValueOrThrow(
    poolObj.data.type.split('<')[1]?.slice(0, -1).trim(),
    'Pool lp coin type not found'
  );

  return {
    objectId: poolObj.data.objectId,
    lpCoinType,
    version: poolObj.data.version,
    digest: poolObj.data.digest,
    type: poolObj.data.type,
    stateObjectId: pathOr('', ['fields', 'state'], poolObj.data.content),
  };
};

export const parseStateObject = (stateObj: SuiObjectResponse) => {
  invariant(stateObj.data, 'State object data not found');
  invariant(stateObj.data.content, 'State object content not found');
  invariant('fields' in stateObj.data.content, 'State object fields not found');

  return {
    balances: pathOr([], ['balances'], stateObj.data.content.fields).map((x) =>
      BigInt(x)
    ),
    coins: pathOr([], ['coins'], stateObj.data.content.fields).map((x) =>
      normalizeStructTag(pathOr('', ['fields', 'name'], x))
    ),
    fees: {
      adminFee: BigInt(
        pathOr(0, ['fees', 'fields', 'admin_fee'], stateObj.data.content.fields)
      ),
      deadline: BigInt(
        pathOr(0, ['fees', 'fields', 'deadline'], stateObj.data.content.fields)
      ),
      fee: BigInt(
        pathOr(0, ['fees', 'fields', 'fee'], stateObj.data.content.fields)
      ),
      futureFee: BigInt(
        pathOr(
          0,
          ['fees', 'fields', 'future_fee'],
          stateObj.data.content.fields
        )
      ),
      futureAdminFee: BigInt(
        pathOr(
          0,
          ['fees', 'fields', 'future_admin_fee'],
          stateObj.data.content.fields
        )
      ),
    },
    futureA: +pathOr(0, ['future_a'], stateObj.data.content.fields) / 100,
    futureATime: +pathOr(0, ['future_a_time'], stateObj.data.content.fields),
    initialA: +pathOr(0, ['initial_a'], stateObj.data.content.fields) / 100,
    initialATime: +pathOr(0, ['initial_a_time'], stateObj.data.content.fields),
    metadatas: pathOr(
      [],
      ['metadata_map', 'fields', 'contents'],
      stateObj.data.content.fields
    ).reduce(
      (acc: Record<string, PoolMetadataValue>, x: any) => {
        return {
          ...acc,
          [normalizeStructTag(
            pathOr('', ['fields', 'key', 'fields', 'name'], x)
          )]: {
            index: +pathOr(0, ['fields', 'value', 'fields', 'index'], x),
            scalar: +pathOr(0, ['fields', 'value', 'fields', 'scalar'], x),
          },
        };
      },
      {} as Record<string, PoolMetadataValue>
    ),
  };
};
