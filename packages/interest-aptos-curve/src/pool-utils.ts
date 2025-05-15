import { MoveResource } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';
import { pathOr } from 'ramda';

import { TYPES } from './constants';
import { InterestCurvePool, StablePool, VolatilePrice } from './dex.types';

const addSupply = (acc: InterestCurvePool, resource: MoveResource) => {
  if (resource.type === TYPES.mainnet.CONCURRENT_SUPPLY)
    return {
      ...acc,
      supply: {
        value: pathOr(BigInt(0), ['data', 'current', 'value'], resource),
        maxValue: pathOr(BigInt(0), ['data', 'current', 'max_value'], resource),
      },
    };

  return acc;
};

const calculateStableA = (a0: bigint, t0: bigint, a1: bigint, t1: bigint) => {
  const currentTime = BigInt(Date.now());

  if (currentTime >= t1) return a1;

  return a1 > a0
    ? a0 + ((a1 - a0) * (currentTime - t0)) / (t1 - t0)
    : a0 - ((a0 - a1) * (currentTime - t0)) / (t1 - t0);
};

const addAdminFungibleStore = (
  acc: InterestCurvePool,
  resource: MoveResource
) => {
  if (resource.type === TYPES.mainnet.FUNGIBLE_STORE)
    return {
      ...acc,
      adminFungibleStore: {
        balance: pathOr(BigInt(0), ['data', 'balance'], resource),
        address: pathOr('', ['data', 'metadata', 'inner'], resource),
        type: TYPES.mainnet.FUNGIBLE_STORE,
      },
    };

  return acc;
};

const addLpFaMetadata = (acc: InterestCurvePool, resource: MoveResource) => {
  if (resource.type === TYPES.mainnet.FA_METADATA)
    return {
      ...acc,
      lpFaMetadata: {
        decimals: pathOr(0, ['data', 'decimals'], resource),
        iconURI: pathOr('', ['data', 'icon_uri'], resource),
        name: pathOr('', ['data', 'name'], resource),
        projectURI: pathOr('', ['data', 'project_uri'], resource),
        symbol: pathOr('', ['data', 'symbol'], resource),
      },
    };

  return acc;
};

const addInterestPool = (
  acc: InterestCurvePool,
  resource: MoveResource,
  network: Network
) => {
  if (resource.type === TYPES[network].INTEREST_POOL)
    return {
      ...acc,
      extendRef: pathOr('', ['data', 'extend_ref', 'self'], resource),
      fas: pathOr([], ['data', 'fas'], resource),
      isStable: pathOr(false, ['data', 'is_stable'], resource),
      nFas: pathOr(0, ['data', 'n_fas'], resource),
    };

  return acc;
};

const addStableState = (
  acc: InterestCurvePool,
  resource: MoveResource,
  network: Network
) => {
  console.log(resource);
  if (resource.type === TYPES[network].STABLE_STATE) {
    return {
      ...acc,
      data: {
        a: calculateStableA(
          BigInt(pathOr(0, ['data', 'initial_a'], resource)),
          BigInt(pathOr(0, ['data', 'initial_a_time'], resource)),
          BigInt(pathOr(0, ['data', 'future_a'], resource)),
          BigInt(pathOr(0, ['data', 'future_a_time'], resource))
        ),
        balances: pathOr([], ['data', 'balances'], resource).map((x: string) =>
          BigInt(x)
        ),
        initialA: BigInt(pathOr(0, ['data', 'initial_a'], resource)),
        futureA: BigInt(pathOr(0, ['data', 'future_a'], resource)),
        initialATime: BigInt(pathOr(0, ['data', 'initial_a_time'], resource)),
        futureATime: BigInt(pathOr(0, ['data', 'future_a_time'], resource)),
        adminFee: BigInt(pathOr(0, ['data', 'admin_fee'], resource)),
        futureFee: BigInt(
          pathOr([0], ['data', 'future_fee', 'vec'], resource)[0] || 0
        ),
        futureAdminFee: BigInt(
          pathOr([0], ['data', 'future_admin_fee', 'vec'], resource)[0] || 0
        ),
        fee: BigInt(pathOr(0, ['data', 'fee'], resource)),
      } as StablePool,
    };
  }

  return acc;
};

const addVolatileState = (
  acc: InterestCurvePool,
  resource: MoveResource,
  network: Network
) => {
  if (resource.type === TYPES[network].VOLATILE_STATE)
    return {
      ...acc,
      data: {
        ...acc.data,
        a: pathOr('', ['data', 'a_gamma', 'a'], resource),
        futureA: pathOr('', ['data', 'a_gamma', 'future_a'], resource),
        futureGamma: pathOr('', ['data', 'a_gamma', 'future_gamma'], resource),
        futureTime: pathOr('', ['data', 'a_gamma', 'future_time'], resource),
        gamma: pathOr('', ['data', 'a_gamma', 'gamma'], resource),
        initialTime: pathOr('', ['data', 'a_gamma', 'initial_time'], resource),
        balances: pathOr([], ['data', 'balances'], resource).map((x: string) =>
          BigInt(x)
        ),
        virtualPrice: pathOr(BigInt(0), ['data', 'virtual_price'], resource),
        xcpProfit: pathOr(BigInt(0), ['data', 'xcp_profit'], resource),
        xcpProfitA: pathOr(BigInt(0), ['data', 'xcp_profit_a'], resource),
        prices: pathOr([], ['data', 'prices', 'data'], resource).reduce(
          (acc: Record<string, VolatilePrice>, price: Record<string, any>) => {
            return {
              ...acc,
              [price.key]: {
                lastPrice: pathOr(BigInt(0), ['last_price'], price.value),
                price: pathOr(BigInt(0), ['price'], price.value),
                priceOracle: pathOr(BigInt(0), ['price_oracle'], price.value),
              },
            };
          },
          {} as Record<string, VolatilePrice>
        ),
        fees: {
          adminFee: pathOr(BigInt(0), ['data', 'fees', 'admin_fee'], resource),
          gammaFee: pathOr(BigInt(0), ['data', 'fees', 'gamma_fee'], resource),
          midFee: pathOr(BigInt(0), ['data', 'fees', 'mid_fee'], resource),
          outFee: pathOr(BigInt(0), ['data', 'fees', 'out_fee'], resource),
        },
        futureFees: {
          adminFee: pathOr(
            BigInt(0),
            ['data', 'future_fees', 'admin_fee'],
            resource
          ),
          gammaFee: pathOr(
            BigInt(0),
            ['data', 'future_fees', 'gamma_fee'],
            resource
          ),
          midFee: pathOr(
            BigInt(0),
            ['data', 'future_fees', 'mid_fee'],
            resource
          ),
          outFee: pathOr(
            BigInt(0),
            ['data', 'future_fees', 'out_fee'],
            resource
          ),
        },
        lastPricesTimestamp: pathOr(
          BigInt(0),
          ['data', 'last_prices_timestamp'],
          resource
        ),
        maxA: pathOr(BigInt(0), ['data', 'max_a'], resource),
        minA: pathOr(BigInt(0), ['data', 'min_a'], resource),
        rebalancingParams: {
          extraProfit: BigInt(
            pathOr('', ['data', 'rebalancing_params', 'extra_profit'], resource)
          ),
          adjustmentStep: BigInt(
            pathOr(
              '',
              ['data', 'rebalancing_params', 'adjustment_step'],
              resource
            )
          ),
          maHalfTime: BigInt(
            pathOr('', ['data', 'rebalancing_params', 'ma_half_time'], resource)
          ),
        },
        futureRebalancingParams: {
          extraProfit: BigInt(
            pathOr(
              '',
              ['data', 'future_rebalancing_params', 'extra_profit'],
              resource
            )
          ),
          adjustmentStep: BigInt(
            pathOr(
              '',
              ['data', 'future_rebalancing_params', 'adjustment_step'],
              resource
            )
          ),
          maHalfTime: BigInt(
            pathOr(
              '',
              ['data', 'future_rebalancing_params', 'ma_half_time'],
              resource
            )
          ),
        },
        d: pathOr(BigInt(0), ['data', 'd'], resource),
      },
    };

  return acc;
};

export const addAllPoolState = (
  acc: InterestCurvePool,
  resource: MoveResource,
  network: Network
): InterestCurvePool => {
  const x = addSupply(acc, resource);
  const y = addAdminFungibleStore(x, resource);
  const z = addLpFaMetadata(y, resource);
  const a = addInterestPool(z, resource, network);
  const b = a.isStable
    ? addStableState(a, resource, network)
    : addVolatileState(a, resource, network);
  return b;
};
