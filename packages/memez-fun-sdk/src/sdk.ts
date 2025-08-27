import { Network, SuiCoreSDK, VecMap } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { ObjectRef } from '@mysten/sui/transactions';
import {
  isValidSuiObjectId,
  normalizeStructTag,
  normalizeSuiObjectId,
} from '@mysten/sui/utils';
import { devInspectAndGetReturnValues, sleep } from '@polymedia/suitcase-core';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import { Modules, PACKAGES, SHARED_OBJECTS } from './constants';
import { MemezFees } from './structs';
import {
  GetFeesArgs,
  GetPoolMetadataArgs,
  MemezFunSharedObjects,
  SdkConstructorArgs,
} from './types/memez.types';
import { getSdkDefaultArgs, parsePumpPool } from './utils';

export class MemezBaseSDK extends SuiCoreSDK {
  packages: (typeof PACKAGES)[Network];
  sharedObjects: MemezFunSharedObjects;
  modules = Modules;

  memezOTW: string;

  MAX_BPS = 10_000;

  MAX_U64 = 18446744073709551615n;

  rpcUrl: string;
  network: Network;

  client: SuiClient;

  defaultSupply = 1_000_000_000_000_000_000n;

  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super();

    const data = {
      ...getSdkDefaultArgs(),
      ...args,
    };

    invariant(
      data.fullNodeUrl,
      'You must provide fullNodeUrl for this specific network'
    );

    invariant(
      data.network,
      'You must provide network for this specific network'
    );

    invariant(
      data.network === Network.MAINNET,
      'Memez SDK 8.0.0 is only supported on mainnet'
    );

    this.rpcUrl = data.fullNodeUrl;
    this.network = data.network;
    this.packages = PACKAGES[data.network];
    this.sharedObjects = SHARED_OBJECTS[data.network];
    this.client = new SuiClient({ url: data.fullNodeUrl });
    this.memezOTW = `${PACKAGES[data.network].MEMEZ.original}::memez::MEMEZ`;
  }

  public env() {
    return {
      network: this.network,
      rpcUrl: this.rpcUrl,
      packages: this.packages,
      sharedObjects: this.sharedObjects,
      memezOTW: this.memezOTW,
    };
  }

  /**
   * Gets an integrator.
   *
   * @param args - An object containing the necessary arguments to get the fees for the pool.
   * @param args.configurationKey - The configuration key to find an integrator's fee configuration.
   *
   * @returns The fees for the pool.
   */
  public async getFees({
    configurationKey,
  }: GetFeesArgs): Promise<typeof MemezFees.$inferType> {
    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'fees',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: false })),
      ],
      typeArguments: [normalizeStructTag(configurationKey)],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [MemezFees],
    ]);

    invariant(result[0], 'No fees found');

    return result[0][0];
  }

  getVersion(tx: Transaction) {
    return tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.VERSION,
      function: 'get_allowed_versions',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.VERSION({ mutable: false })),
      ],
    });
  }

  /**
   * Retrieves the Memez pool object from Sui and parses it.
   * @dev It performs two {SuiClient.multiGetObjects} calls. Increase the sleepMs if you fetch more than 25 pools at once to avoid rate limiting. It calls {sleep} twice.
   *
   * @param pumpId - The objectId of the MemezPool.
   *
   * @returns A parsed MemezPool object.
   */
  public async getMultiplePumpPools(pumpIds: string[], sleepMs = 500) {
    pumpIds = pumpIds.map((x) => normalizeSuiObjectId(x));

    const suiObjects = await this.client.multiGetObjects({
      ids: pumpIds,
      options: { showContent: true },
    });

    await sleep(sleepMs);

    const stateObjects = await this.client.multiGetObjects({
      ids: suiObjects.map((x) =>
        pathOr('0x0', ['data', 'content', 'fields', 'inner_state'], x)
      ),
      options: { showContent: true },
    });

    const pools = suiObjects.map((suiObject, index) => {
      const stateObject = stateObjects[index];

      return parsePumpPool(suiObject, stateObject);
    });

    await sleep(sleepMs);

    const metadatas = await this.getMultiplePoolMetadata(
      pools.map((pool) => ({
        poolId: pool.objectId,
        quoteCoinType: pool.quoteCoinType,
        memeCoinType: pool.memeCoinType,
        curveType: pool.curveType,
      }))
    );

    pools.forEach((pool, index) => {
      pool.metadata = metadatas[index];
    });

    return pools;
  }

  /**
   * Retrieves the Memez pool object from Sui and parses it.
   *
   * @param pumpId - The objectId of the MemezPool.
   *
   * @returns A parsed MemezPool object.
   */
  public async getPumpPool(pumpId: string) {
    pumpId = normalizeSuiObjectId(pumpId);

    const suiObject = await this.client.getObject({
      id: pumpId,
      options: { showContent: true },
    });

    const stateId = pathOr(
      '0x0',
      ['data', 'content', 'fields', 'inner_state'],
      suiObject
    );

    const stateObject = await this.client.getObject({
      id: stateId,
      options: { showContent: true },
    });

    const pool = parsePumpPool(suiObject, stateObject);

    pool.metadata = await this.getPoolMetadata({
      poolId: pool.objectId,
      quoteCoinType: pool.quoteCoinType,
      memeCoinType: pool.memeCoinType,
      curveType: pool.curveType,
    });

    return pool;
  }

  public async getMultiplePoolMetadata(
    metadataParams: GetPoolMetadataArgs[]
  ): Promise<Record<string, string>[]> {
    const tx = new Transaction();

    metadataParams.forEach((param) => {
      tx.moveCall({
        package: this.packages.MEMEZ_FUN.latest,
        module: this.modules.FUN,
        function: 'metadata',
        arguments: [tx.object(param.poolId)],
        typeArguments: [
          normalizeStructTag(param.curveType),
          normalizeStructTag(param.memeCoinType),
          normalizeStructTag(param.quoteCoinType),
        ],
      });
    });

    const result = await devInspectAndGetReturnValues(
      this.client,
      tx,
      metadataParams.map(() => [VecMap(bcs.string(), bcs.string())])
    );

    return result.map((x) => {
      return (x[0] as any).contents?.reduce(
        (acc: Record<string, string>, elem: any) => {
          return {
            ...acc,
            [elem.key]: elem.value,
          };
        },
        {} as Record<string, string>
      );
    });
  }

  public async getPoolMetadata({
    poolId,
    quoteCoinType,
    memeCoinType,
    curveType,
  }: GetPoolMetadataArgs): Promise<Record<string, string>> {
    poolId = normalizeSuiObjectId(poolId);

    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.FUN,
      function: 'metadata',
      arguments: [tx.object(poolId)],
      typeArguments: [
        normalizeStructTag(curveType),
        normalizeStructTag(memeCoinType),
        normalizeStructTag(quoteCoinType),
      ],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [VecMap(bcs.string(), bcs.string())],
    ]);

    invariant(result[0][0], 'No metadata found');

    const metadata = (result[0][0] as any).contents?.reduce(
      (acc: Record<string, string>, elem: any) => {
        return {
          ...acc,
          [elem.key]: elem.value,
        };
      },
      {} as Record<string, string>
    );

    return metadata;
  }

  async getCoinMetadataAndType(memeCoinTreasuryCap: string | ObjectRef) {
    const memeCoinTreasuryCapId =
      typeof memeCoinTreasuryCap === 'string'
        ? memeCoinTreasuryCap
        : memeCoinTreasuryCap.objectId;

    invariant(
      isValidSuiObjectId(memeCoinTreasuryCapId),
      'memeCoinTreasuryCap must be a valid Sui objectId'
    );

    const treasuryCap = await this.client.getObject({
      id: memeCoinTreasuryCapId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    const treasuryCapTotalSupply = +pathOr(
      /// Force an error if we do not find the field
      '1',
      ['data', 'content', 'fields', 'total_supply', 'fields', 'value'],
      treasuryCap
    );

    invariant(
      treasuryCapTotalSupply === 0,
      'TreasuryCap Error: Total Supply is not 0 or not found'
    );

    const memeCoinType = treasuryCap.data?.type?.split('<')[1]?.slice(0, -1);

    invariant(memeCoinType, 'Invalid TreasuryCap: no memeCoinType found');

    const coinMetadata = await this.client.getCoinMetadata({
      coinType: memeCoinType,
    });

    invariant(coinMetadata?.id, 'Invalid TreasuryCap: no coin metadata found');

    return {
      memeCoinType,
      coinMetadataId: coinMetadata.id!,
    };
  }
}
