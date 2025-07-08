import { SuiObjectResponse } from '@mysten/sui/client';
import { normalizeStructTag } from '@mysten/sui/utils';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import { TidePool } from './tide.types';

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
    lastUpdateMs: BigInt(pathOr(0, ['fields', 'last_update_ms'], data.content)),
    maxUpdateDelayMs: BigInt(
      pathOr(0, ['fields', 'max_update_delay_ms'], data.content)
    ),
    paused: pathOr(false, ['fields', 'paused'], data.content),
    priceX: {
      max: BigInt(
        pathOr(0, ['fields', 'price_x', 'fields', 'max'], data.content)
      ),
      min: BigInt(
        pathOr(0, ['fields', 'price_x', 'fields', 'min'], data.content)
      ),
      value: BigInt(
        pathOr(0, ['fields', 'price_x', 'fields', 'value'], data.content)
      ),
    },
    priceY: {
      max: BigInt(
        pathOr(0, ['fields', 'price_y', 'fields', 'max'], data.content)
      ),
      min: BigInt(
        pathOr(0, ['fields', 'price_y', 'fields', 'min'], data.content)
      ),
      value: BigInt(
        pathOr(0, ['fields', 'price_y', 'fields', 'value'], data.content)
      ),
    },
    poolVersion: Number(pathOr(0, ['fields', 'version'], data.content)),
    virtualXLiquidity: BigInt(
      pathOr(0, ['fields', 'virtual_x_liquidity'], data.content)
    ),
  } as any;
};
