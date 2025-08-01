import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeStructTag, normalizeSuiObjectId } from '@mysten/sui/utils';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import { BASIS_POINTS, RebalanceAction } from './constants';
import { CalculateRebalanceActionArgs, TidePool } from './tide.types';

export const parseTidePool = (pool: SuiObjectResponse): TidePool => {
  const data = pool.data;
  invariant(data?.content);

  return {
    objectId: data.objectId,
    version: data.version,
    digest: data.digest,
    coinXType: normalizeStructTag(
      pathOr('', ['fields', 'x', 'fields', 'name'], data.content)
    ),
    coinYType: normalizeStructTag(
      pathOr('', ['fields', 'y', 'fields', 'name'], data.content)
    ),
    decimalsX: BigInt(pathOr(0, ['fields', 'decimals_x'], data.content)),
    decimalsY: BigInt(pathOr(0, ['fields', 'decimals_y'], data.content)),
    feeX: BigInt(pathOr(0, ['fields', 'fee_x'], data.content)),
    feeY: BigInt(pathOr(0, ['fields', 'fee_y'], data.content)),
    maxAge: Number(pathOr(0, ['fields', 'max_age'], data.content)),
    maxDeviationPercentage: BigInt(
      pathOr(0, ['fields', 'max_deviation_percentage'], data.content)
    ),
    packageVersion: Number(pathOr(0, ['fields', 'version'], data.content)),
    virtualXLiquidity: BigInt(
      pathOr(0, ['fields', 'virtual_x_liquidity'], data.content)
    ),
    feedX: normalizeSuiObjectId(pathOr('', ['fields', 'feed_x'], data.content)),
    feedY: normalizeSuiObjectId(pathOr('', ['fields', 'feed_y'], data.content)),
    xyPaused: pathOr(false, ['fields', 'x_y_paused'], data.content),
    yxPaused: pathOr(false, ['fields', 'y_x_paused'], data.content),
  };
};

const diff = (a: bigint, b: bigint) => (a > b ? a - b : b - a);

const calculatePercentage = (difference: bigint, base: bigint): bigint =>
  (difference * BASIS_POINTS) / base;

const isAboveThreshold = ({
  desiredAmount,
  currentAmount,
  threshold,
}: CalculateRebalanceActionArgs): boolean => {
  const difference = diff(currentAmount, desiredAmount);
  const percentDiff = calculatePercentage(difference, desiredAmount);

  return percentDiff >= threshold;
};

export const calculateRebalanceAction = ({
  currentAmount,
  desiredAmount,
  threshold,
}: CalculateRebalanceActionArgs) => {
  const pred = isAboveThreshold({
    desiredAmount,
    currentAmount,
    threshold,
  });

  if (!pred)
    return {
      amount: 0n,
      action: RebalanceAction.None,
    };

  const addOrRemove =
    currentAmount > desiredAmount
      ? RebalanceAction.Remove
      : RebalanceAction.Add;

  return {
    amount: diff(currentAmount, desiredAmount),
    action: addOrRemove,
  };
};
