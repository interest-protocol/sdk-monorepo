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
  toHex,
} from '@mysten/sui/utils';
import { Decimal } from 'decimal.js';
import { pathOr } from 'ramda';

import {
  GetMemeCoinMarketCapArgs,
  MemezPool,
  PumpState,
  SdkConstructorArgs,
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
    memeReferrerFee: +pathOr(
      '0',
      [
        'data',
        'content',
        'fields',
        'constant_product',
        'fields',
        'meme_referrer_fee',
        'fields',
        'pos0',
      ],
      stateObject
    ),
    quoteReferrerFee: +pathOr(
      0,
      [
        'data',
        'content',
        'fields',
        'constant_product',
        'fields',
        'quote_referrer_fee',
        'fields',
        'pos0',
      ],
      stateObject
    ),
  } as PumpState;

  const publicKey = pathOr(
    new Uint8Array(0),
    ['data', 'content', 'fields', 'public_key'],
    objectResponse
  );

  const publicKeyHex = publicKey.length > 0 ? toHex(publicKey) : '';

  return {
    objectId: normalizeSuiObjectId(
      pathOr('0x0', ['data', 'objectId'], objectResponse)
    ),
    poolType,
    quoteCoinType,
    memeCoinType,
    curveType,
    publicKey: publicKeyHex,
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
