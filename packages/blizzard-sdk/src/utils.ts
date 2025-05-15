import { getFullnodeUrl, SuiObjectResponse } from '@mysten/sui/client';
import { normalizeSuiAddress, normalizeSuiObjectId } from '@mysten/sui/utils';
import { pathOr } from 'ramda';

import {
  BlizzardStaking,
  GetMsUntilNextEpochArgs,
  SdkConstructorArgs,
} from './blizzard.types';
import { PACKAGES, SHARED_OBJECTS, TYPES } from './constants';

export const getSdkDefaultArgs = (): SdkConstructorArgs => ({
  packages: PACKAGES,
  fullNodeUrl: getFullnodeUrl('mainnet'),
  sharedObjects: SHARED_OBJECTS,
  types: TYPES,
});

export const msToHours = (ms: number) => {
  return Math.ceil(ms / (1000 * 60 * 60));
};

export const msToDays = (ms: number) => {
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const getFees = (response: SuiObjectResponse) => {
  const fields = pathOr(
    {},
    ['data', 'content', 'fields', 'fee_config', 'fields'],
    response
  );

  const fieldPath = ['fields', 'pos0'];

  return {
    mint: pathOr(0, ['mint', ...fieldPath], fields),
    burn: pathOr(0, ['burn', ...fieldPath], fields),
    transmute: pathOr(0, ['transmute', ...fieldPath], fields),
  };
};

export const getEpochData = (response: SuiObjectResponse) => {
  const fields = pathOr(
    {},
    ['data', 'content', 'fields', 'value', 'fields'],
    response
  );

  const currentEpoch = +pathOr('0', ['epoch'], fields);
  const epochDurationMs = +pathOr('0', ['epoch_duration'], fields);
  const firstEpochStartTimestamp = +pathOr('0', ['first_epoch_start'], fields);

  const msUntilNextEpoch = getMsUntilNextEpoch({
    currentEpoch,
    epochDurationMs,
    firstEpochStartTimestamp,
  });

  return {
    currentEpoch,
    epochDurationMs,
    firstEpochStartTimestamp,
    msUntilNextEpoch,
  };
};

export const getMsUntilNextEpoch = (
  epochData: GetMsUntilNextEpochArgs
): number => {
  const { currentEpoch, epochDurationMs, firstEpochStartTimestamp } = epochData;

  const now = Date.now();

  const nextEpochStartTimestamp =
    firstEpochStartTimestamp + currentEpoch * epochDurationMs;

  return nextEpochStartTimestamp - now;
};

export const getStakeNFTData = (response: SuiObjectResponse) => {
  const fields = pathOr({}, ['data', 'content', 'fields'], response);

  return {
    principal: BigInt(pathOr('0', ['value'], fields)),
    activationEpoch: pathOr(0, ['activation_epoch'], fields),
    id: normalizeSuiAddress(pathOr('0x0', ['id', 'id'], fields)),
    symbol: pathOr('', ['symbol'], fields),
    typeName: pathOr('', ['type_name', 'fields', 'name'], fields),
    nodeId: normalizeSuiAddress(
      pathOr('0x0', ['inner', 'fields', 'node_id'], fields)
    ),
    state: pathOr('', ['inner', 'fields', 'state', 'variant'], fields),
  };
};

export const formatBlizzardStaking = async (
  object: SuiObjectResponse
): Promise<Omit<BlizzardStaking, 'objectId' | 'type' | 'lstSupply'>> => {
  const fields = pathOr({}, ['data', 'content', 'fields'], object);

  return {
    paused: pathOr(false, ['paused'], fields),
    walFeeBalance: pathOr(0n, ['wal_fees', 'fields', 'fee'], fields),
    lstFeeBalance: pathOr(0n, ['lst_fees', 'fields', 'fee'], fields),
    totalWalDeposited: pathOr(0n, ['total_wal_value'], fields),
    allowedNodes: pathOr(
      [],
      ['allowed_nodes', 'fields', 'contents'],
      fields
    ).map((node) => normalizeSuiObjectId(node)),
    feeConfig: {
      mint: BigInt(
        pathOr(0, ['fee_config', 'fields', 'mint', 'fields', 'pos0'], fields)
      ),
      burn: BigInt(
        pathOr(0, ['fee_config', 'fields', 'burn', 'fields', 'pos0'], fields)
      ),
      transmute: BigInt(
        pathOr(
          0,
          ['fee_config', 'fields', 'transmute', 'fields', 'pos0'],
          fields
        )
      ),
      protocol: BigInt(
        pathOr(
          0,
          ['fee_config', 'fields', 'protocol', 'fields', 'pos0'],
          fields
        )
      ),
    },
  };
};
