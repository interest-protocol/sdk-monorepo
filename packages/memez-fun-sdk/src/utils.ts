import { returnIfDefinedOrThrow } from '@interest-protocol/lib';
import { Network } from '@interest-protocol/sui-core-sdk';
import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectResponse,
} from '@mysten/sui/client';
import {
  normalizeStructTag,
  normalizeSuiAddress,
  normalizeSuiObjectId,
} from '@mysten/sui/utils';
import { Decimal } from 'decimal.js';
import { pathOr } from 'ramda';

import {
  GetMemeCoinMarketCapArgs,
  MemezPool,
  PumpState,
  SdkConstructorArgs,
  StableState,
} from './types/memez.types';

export const getSdkDefaultArgs = (): SdkConstructorArgs => ({
  network: Network.MAINNET,
  fullNodeUrl: getFullnodeUrl('mainnet'),
});

// USD Price
export const getMemeCoinMarketCap = ({
  quoteBalance,
  virtualLiquidity,
  memeBalance,
  quoteUSDPrice,
  memeCoinTotalSupply = 1_000_000_000n,
}: GetMemeCoinMarketCapArgs) => {
  if (
    quoteBalance + virtualLiquidity === 0n ||
    quoteUSDPrice == 0 ||
    memeBalance === 0n
  ) {
    return 0;
  }

  const quoteBalanceDecimal = new Decimal(quoteBalance.toString());
  const virtualLiquidityDecimal = new Decimal(virtualLiquidity.toString());
  const memeBalanceDecimal = new Decimal(memeBalance.toString());
  const quoteUSDPriceDecimal = new Decimal(quoteUSDPrice.toString());

  const memeCoinPrice = quoteBalanceDecimal
    .plus(virtualLiquidityDecimal)
    .times(quoteUSDPriceDecimal)
    .div(memeBalanceDecimal);

  return memeCoinPrice.times(memeCoinTotalSupply.toString()).toNumber();
};

export const parsePoolType = (x: string) => {
  return {
    poolType: x,
    curveType: normalizeStructTag(
      returnIfDefinedOrThrow(
        x.split('<')?.[1]?.split(',')?.[0],
        'Curve Type Not Found when parsing pool'
      )
    ),
    memeCoinType: normalizeStructTag(
      returnIfDefinedOrThrow(
        x.split('<')?.[1]?.split(',')?.[1]?.trim(),
        'Meme Coin Type Not Found when parsing pool'
      )
    ),
    quoteCoinType: normalizeStructTag(
      returnIfDefinedOrThrow(
        x.split('<')?.[1]?.split(',')?.[2]?.trim()?.slice(0, -1),
        'Quote Coin Type Not Found when parsing pool'
      )
    ),
  };
};

export const parseStablePool = async (
  client: SuiClient,
  objectResponse: SuiObjectResponse
): Promise<MemezPool<StableState>> => {
  const { poolType, memeCoinType, curveType, quoteCoinType } = parsePoolType(
    pathOr('0x0', ['data', 'content', 'type'], objectResponse)
  );

  const stateId = pathOr(
    '0x0',
    ['data', 'content', 'fields', 'state', 'fields', 'id', 'id'],
    objectResponse
  );

  const dynamicField = await client.getDynamicFields({
    parentId: stateId,
  });

  const dynamicFieldDataId = pathOr('0x0', ['objectId'], dynamicField.data[0]);

  const stateObject = await client.getObject({
    id: dynamicFieldDataId,
    options: { showContent: true },
  });

  const curveState = {
    memeReserve: BigInt(
      pathOr(0n, ['data', 'content', 'fields', 'meme_reserve'], stateObject)
    ),
    developerAllocation: BigInt(
      pathOr(0n, ['data', 'content', 'fields', 'dev_allocation'], stateObject)
    ),
    developerVestingPeriod: BigInt(
      pathOr(
        0n,
        ['data', 'content', 'fields', 'dev_vesting_period'],
        stateObject
      )
    ),
    memeLiquidityProvision: BigInt(
      pathOr(
        0n,
        ['data', 'content', 'fields', 'liquidity_provision'],
        stateObject
      )
    ),
    migrationFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'migration_fee',
        'fields',
        'pos0',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    quoteRaiseAmount: BigInt(
      pathOr(
        0n,
        [
          'data',
          'content',
          'fields',
          'fixed_rate',
          'fields',
          'quote_raise_amount',
        ],
        stateObject
      )
    ),
    memeSaleAmount: BigInt(
      pathOr(
        0n,
        [
          'data',
          'content',
          'fields',
          'fixed_rate',
          'fields',
          'meme_sale_amount',
        ],
        stateObject
      )
    ),
    memeSwapFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'fixed_rate',
        'fields',
        'meme_swap_fee',
        'fields',
        'pos0',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    quoteSwapFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'fixed_rate',
        'fields',
        'quote_swap_fee',
        'fields',
        'pos0',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    memeBalance: BigInt(
      pathOr(
        0n,
        ['data', 'content', 'fields', 'fixed_rate', 'fields', 'meme_balance'],
        stateObject
      )
    ),
    quoteBalance: BigInt(
      pathOr(
        0n,
        ['data', 'content', 'fields', 'fixed_rate', 'fields', 'quote_balance'],
        stateObject
      )
    ),
    allocation: {
      memeBalance: BigInt(
        pathOr(
          0n,
          ['data', 'content', 'fields', 'allocation', 'fields', 'balance'],
          stateObject
        )
      ),
      vestingPeriod: BigInt(
        pathOr(
          0n,
          [
            'data',
            'content',
            'fields',
            'allocation',
            'fields',
            'vesting_period',
          ],
          stateObject
        )
      ),
      recipients: pathOr(
        [],
        [
          'data',
          'content',
          'fields',
          'allocation',
          'fields',
          'distributor',
          'fields',
          'recipients',
        ],
        stateObject
      ).map((recipient: any) => ({
        address: normalizeSuiAddress(recipient?.fields?.address || '0x0'),
        bps: +recipient?.fields?.bps?.fields?.pos0 || 0,
      })),
    },
  };

  return {
    objectId: normalizeSuiObjectId(
      pathOr('0x0', ['data', 'objectId'], objectResponse)
    ),
    poolType,
    quoteCoinType,
    memeCoinType,
    curveType,
    usesTokenStandard: pathOr(
      false,
      ['data', 'content', 'fields', 'is_token'],
      objectResponse
    ),
    ipxMemeCoinTreasury: normalizeSuiObjectId(
      pathOr(
        '0x0',
        ['data', 'content', 'fields', 'ipx_meme_coin_treasury'],
        objectResponse
      )
    ),
    metadata: {},
    migrationWitness: normalizeStructTag(
      pathOr(
        '0x0',
        ['data', 'content', 'fields', 'migration_witness', 'fields', 'name'],
        objectResponse
      )
    ),
    dynamicFieldDataId,
    progress: pathOr(
      '0x0',
      ['data', 'content', 'fields', 'progress', 'variant'],
      objectResponse
    ),
    stateId,
    curveState,
  };
};

export const parsePumpPool = async (
  client: SuiClient,
  objectResponse: SuiObjectResponse
): Promise<MemezPool<PumpState>> => {
  const { poolType, memeCoinType, curveType, quoteCoinType } = parsePoolType(
    pathOr('0x0', ['data', 'content', 'type'], objectResponse)
  );

  const stateId = pathOr(
    '0x0',
    ['data', 'content', 'fields', 'state', 'fields', 'id', 'id'],
    objectResponse
  );

  const dynamicField = await client.getDynamicFields({
    parentId: stateId,
  });

  const dynamicFieldDataId = pathOr('0x0', ['objectId'], dynamicField.data[0]);

  const stateObject = await client.getObject({
    id: dynamicFieldDataId,
    options: { showContent: true },
  });

  const curveState = {
    burnTax: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'constant_product',
        'fields',
        'burner',
        'fee',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    allocation: {
      memeBalance: BigInt(
        pathOr(
          0n,
          ['data', 'content', 'fields', 'allocation', 'fields', 'balance'],
          stateObject
        )
      ),
      vestingPeriod: BigInt(
        pathOr(
          0n,
          [
            'data',
            'content',
            'fields',
            'allocation',
            'fields',
            'vesting_period',
          ],
          stateObject
        )
      ),
      recipients: pathOr(
        [],
        [
          'data',
          'content',
          'fields',
          'allocation',
          'fields',
          'distributor',
          'fields',
          'recipients',
        ],
        stateObject
      ).map((recipient: any) => ({
        address: normalizeSuiAddress(recipient?.fields?.address || '0x0'),
        bps: +recipient?.fields?.bps?.fields?.pos0 || 0,
      })),
    },
    memeBalance: BigInt(
      pathOr(
        0n,
        [
          'data',
          'content',
          'fields',
          'constant_product',
          'fields',
          'meme_balance',
        ],
        stateObject
      )
    ),
    quoteBalance: BigInt(
      pathOr(
        0n,
        [
          'data',
          'content',
          'fields',
          'constant_product',
          'fields',
          'quote_balance',
        ],
        stateObject
      )
    ),
    memeSwapFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'constant_product',
        'fields',
        'meme_swap_fee',
        'fields',
        'pos0',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    quoteSwapFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'constant_product',
        'fields',
        'quote_swap_fee',
        'fields',
        'pos0',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    liquidityProvision: BigInt(
      pathOr(
        0n,
        ['data', 'content', 'fields', 'value', 'fields', 'liquidity_provision'],
        stateObject
      )
    ),
    migrationFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'migration_fee',
        'fields',
        'pos0',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    virtualLiquidity: BigInt(
      pathOr(
        0n,
        [
          'data',
          'content',
          'fields',
          'constant_product',
          'fields',
          'virtual_liquidity',
        ],
        stateObject
      )
    ),
    targetQuoteLiquidity: BigInt(
      pathOr(
        0n,
        [
          'data',
          'content',
          'fields',
          'constant_product',
          'fields',
          'target_quote_liquidity',
        ],
        stateObject
      )
    ),
    devPurchase: BigInt(
      pathOr(0n, ['data', 'content', 'fields', 'dev_purchase'], stateObject)
    ),
  } as PumpState;

  return {
    objectId: normalizeSuiObjectId(
      pathOr('0x0', ['data', 'objectId'], objectResponse)
    ),
    poolType,
    quoteCoinType,
    memeCoinType,
    curveType,
    usesTokenStandard: pathOr(
      false,
      ['data', 'content', 'fields', 'is_token'],
      objectResponse
    ),
    ipxMemeCoinTreasury: normalizeSuiObjectId(
      pathOr(
        '0x0',
        ['data', 'content', 'fields', 'ipx_meme_coin_treasury'],
        objectResponse
      )
    ),
    metadata: {},
    migrationWitness: normalizeStructTag(
      pathOr(
        '0x0',
        ['data', 'content', 'fields', 'migration_witness', 'fields', 'name'],
        objectResponse
      )
    ),
    dynamicFieldDataId,
    progress: pathOr(
      '0x0',
      ['data', 'content', 'fields', 'progress', 'variant'],
      objectResponse
    ),
    stateId,
    curveState,
  };
};
