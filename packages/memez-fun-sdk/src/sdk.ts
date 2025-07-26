import { Network, SuiCoreSDK, VecMap } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { ObjectRef } from '@mysten/sui/transactions';
import {
  isValidSuiObjectId,
  normalizeStructTag,
  normalizeSuiAddress,
  normalizeSuiObjectId,
} from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import { Modules, PACKAGES, SHARED_OBJECTS } from './constants';
import { MemezFees } from './structs';
import {
  GetFeesArgs,
  GetPoolMetadataArgs,
  MemezFunSharedObjects,
  MemezPool,
  PumpState,
  SdkConstructorArgs,
} from './types/memez.types';
import { getSdkDefaultArgs, parsePumpPool } from './utils';

const pumpPoolCache = new Map<string, MemezPool<PumpState>>();
const metadataCache = new Map<string, Record<string, string>>();

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
   *
   * @param pumpId - The objectId of the MemezPool.
   *
   * @returns A parsed MemezPool object.
   */
  public async getPumpPool(pumpId: string) {
    pumpId = normalizeSuiObjectId(pumpId);

    if (pumpPoolCache.has(pumpId)) {
      return pumpPoolCache.get(pumpId)!;
    }

    const suiObject = await this.client.getObject({
      id: pumpId,
      options: { showContent: true },
    });

    const pool = await parsePumpPool(this.client, suiObject);

    pool.metadata = await this.getPoolMetadata({
      poolId: pool.objectId,
      quoteCoinType: pool.quoteCoinType,
      memeCoinType: pool.memeCoinType,
      curveType: pool.curveType,
    });

    pumpPoolCache.set(pumpId, pool);

    return pool;
  }

  public async getPoolMetadata({
    poolId,
    quoteCoinType,
    memeCoinType,
    curveType,
  }: GetPoolMetadataArgs): Promise<Record<string, string>> {
    poolId = normalizeSuiObjectId(poolId);

    if (metadataCache.has(poolId)) {
      return metadataCache.get(poolId)!;
    }

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

    const metadataVecMap = await this.client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: normalizeSuiAddress('0x0'),
    });

    invariant(
      metadataVecMap.results?.[0]?.returnValues?.[0]?.[0],
      'No metadata found'
    );

    const metadata = VecMap(bcs.string(), bcs.string())
      .parse(Uint8Array.from(metadataVecMap.results[0].returnValues[0][0]))
      .contents.reduce(
        (acc: Record<string, string>, elem) => {
          return {
            ...acc,
            [elem.key]: elem.value,
          };
        },
        {} as Record<string, string>
      );

    metadataCache.set(poolId, metadata);

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
