import {
  AccountAddress,
  Aptos,
  MoveResource,
  MoveValue,
} from '@aptos-labs/ts-sdk';
import { returnIfDefinedOrThrow } from '@interest-protocol/lib';
import {
  MoveResourceType,
  moveResourceTypeToStructTag,
} from '@interest-protocol/movement-core-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';
import {
  bardockClient,
  movementMainnetClient,
} from '@interest-protocol/movement-core-sdk';
import { pathOr, propOr } from 'ramda';

import { DEFAULT_VOLATILE_POOL, FUNGIBLE_ASSETS, TYPES } from './constants';
import {
  CoinBalance,
  ConstructorArgs,
  FaMetadata,
  FaPayload,
  Farm,
  FaSupply,
  InterestCurvePool,
} from './dex.types';
import {
  findConcurrentSupply,
  findFaMetadata,
  findObjectCore,
  findPairedCoinType,
} from './getters';
import { addAllPoolState } from './pool-utils';

export const getDefaultClient = (network: Network): Aptos => {
  if (network === Network.BARDOCK) return bardockClient;

  return movementMainnetClient;
};

export const getDefaultConstructorArgs = (): ConstructorArgs => {
  return {
    client: movementMainnetClient,
    network: Network.MAINNET,
  };
};

export const NEW_STABLE_POOL_COIN_FUNCTION_NAME = {
  2: 'new_stable_2_coin_pool',
  3: 'new_stable_3_coin_pool',
  4: 'new_stable_4_coin_pool',
  5: 'new_stable_5_coin_pool',
  6: 'new_stable_6_coin_pool',
} as Record<number, string>;

export const NEW_VOLATILE_POOL_COIN_FUNCTION_NAME = {
  2: 'new_volatile_2_coin_pool',
  3: 'new_volatile_3_coin_pool',
  4: 'new_volatile_4_coin_pool',
  5: 'new_volatile_5_coin_pool',
  6: 'new_volatile_6_coin_pool',
} as Record<number, string>;

const makeFaSupply = (resources: MoveResource[]): FaSupply => {
  const concurrentSupplyData = findConcurrentSupply(resources);

  const concurrentSupply = pathOr(
    null,
    ['data', 'current'],
    concurrentSupplyData
  ) as Record<string, string> | null;

  const supply = {
    maxValue: BigInt(propOr(0, 'max_value', concurrentSupply)),
    value: BigInt(propOr(0, 'value', concurrentSupply)),
  };

  return supply;
};

export const toFaMetadata = (resources: MoveResource[]): FaMetadata => {
  const faMetadataData = findFaMetadata(resources);

  return {
    decimals: pathOr(0, ['data', 'decimals'], faMetadataData),
    iconURI: pathOr('', ['data', 'icon_uri'], faMetadataData),
    name: pathOr('', ['data', 'name'], faMetadataData),
    projectURI: pathOr('', ['data', 'project_uri'], faMetadataData),
    symbol: pathOr('', ['data', 'symbol'], faMetadataData),
  };
};

export const toFaPayload = (resources: MoveResource[]): FaPayload => {
  const pairedCoinTypeResource = findPairedCoinType(resources);

  const pairedCoinTypeData = pathOr(
    null,
    ['data', 'type'],
    pairedCoinTypeResource
  ) as MoveResourceType | null;

  const objectCoreData = findObjectCore(resources);

  return {
    pairedCoinType: pairedCoinTypeData
      ? moveResourceTypeToStructTag(pairedCoinTypeData)
      : null,
    metadata: toFaMetadata(resources),
    address: AccountAddress.from(
      pathOr(
        '0x0',
        ['data', 'transfer_events', 'guid', 'id', 'addr'],
        objectCoreData
      )
    ),
    supply: makeFaSupply(resources),
    allowsUngatedTransfer: pathOr(
      false,
      ['data', 'allow_ungated_transfer'],
      objectCoreData
    ),
    owner: AccountAddress.from(
      pathOr('0x0', ['data', 'owner'], objectCoreData)
    ),
  };
};

export const toFarms = (farms: string[], values: MoveValue[]): Farm[] => {
  return farms.map((farm, index) => {
    const value = (values[index] as any)[0];

    return {
      rewards: value.rewards.map(
        ({ inner }: { inner: string }, index: number) => {
          const fa = FUNGIBLE_ASSETS[AccountAddress.from(inner).toString()];

          return {
            rewardFa: fa,
            balance: BigInt(value.reward_balances[index]),
            rewardsPerSecond: BigInt(value.reward_per_second[index]),
          };
        }
      ),
      address: farm,
      stakedBalance: BigInt(value.staked_balance),
      startTimestamp: BigInt(value.start_timestamp),
      stakedFa: returnIfDefinedOrThrow(
        FUNGIBLE_ASSETS[AccountAddress.from(value.staked_fa.inner).toString()],
        `No fungible asset found for address ${AccountAddress.from(value.staked_fa.inner).toString()}`
      ),
    };
  });
};

export const toInterestPool = (
  pool: string,
  resources: MoveResource[],
  network: Network
): InterestCurvePool => {
  const data = resources.reduce((acc, resource) => {
    return addAllPoolState(acc, resource, network);
  }, DEFAULT_VOLATILE_POOL as InterestCurvePool);

  return {
    ...data,
    address: pool,
  };
};

export const getCoinTypeFromCoinStoreType = (coinStoreType: string) =>
  returnIfDefinedOrThrow(
    coinStoreType.split('<')?.[1]?.split('>')[0],
    `Invalid coin store type: ${coinStoreType}`
  );

export const getAddressCoinBalances = async (
  account: string,
  client: Aptos
): Promise<CoinBalance[]> => {
  const data = await client.getAccountResources({
    accountAddress: AccountAddress.from(account),
  });

  return data
    .filter((resource) => resource.type.startsWith(TYPES.mainnet.COIN_STORE))
    .map((resource) => ({
      type: getCoinTypeFromCoinStoreType(resource.type),
      balance: BigInt(pathOr(0, ['data', 'coin', 'value'], resource)),
    }));
};
