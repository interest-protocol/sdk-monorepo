import {
  ID,
  OptionU64,
  SharedObject,
  SuiCoreSDK,
} from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  isValidSuiAddress,
  normalizeStructTag,
  normalizeSuiAddress,
  normalizeSuiObjectId,
} from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { Decimal } from 'decimal.js';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import {
  AddNodeArgs,
  BlizzardStaking,
  BurnLstArgs,
  BurnStakeNftArgs,
  ClaimFeesArgs,
  FcfsArgs,
  KeepStakeNftArgs,
  LastEpochAprArgs,
  MintAfterVotesFinishedArgs,
  MintArgs,
  NewLSTArgs,
  RemoveNodeArgs,
  SdkConstructorArgs,
  SyncExchangeRateArgs,
  ToLstAtEpochArgs,
  ToWalAtEpochArgs,
  TransmuteArgs,
  UpdateMetadataArgs,
  VectorTransferStakedWalArgs,
  ViewFcfsArgs,
} from './blizzard.types';
import { Package, SharedObjects } from './blizzard.types';
import {
  INNER_LST_STATE_ID,
  INNER_LST_TREASURY_CAP,
  INNER_WALRUS_STAKING_ID,
  SHARED_OBJECTS,
} from './constants';
import { Modules, TYPES } from './constants';
import { IX } from './structs';
import {
  formatBlizzardStaking,
  getEpochData,
  getFees,
  getStakeNFTData,
  msToDays,
} from './utils';
import { getSdkDefaultArgs } from './utils';

const lstTypeCache = new Map<string, string>();

export class BlizzardSDK extends SuiCoreSDK {
  packages: Package;
  sharedObjects: SharedObjects;
  modules = Modules;
  types: typeof TYPES;

  #rpcUrl: string;

  client: SuiClient;

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
      data.packages,
      'You must provide package addresses for this specific network'
    );

    invariant(
      data.sharedObjects,
      'You must provide sharedObjects for this specific network'
    );

    invariant(data.types, 'You must provide types for this specific network');

    this.#rpcUrl = data.fullNodeUrl;
    this.packages = data.packages;
    this.sharedObjects = data.sharedObjects;
    this.types = data.types;
    this.client = new SuiClient({ url: data.fullNodeUrl });
  }

  public networkConfig() {
    return {
      rpcUrl: this.#rpcUrl,
    };
  }

  public getAllowedVersions(tx: Transaction) {
    return tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.AllowedVersions,
      function: 'get_allowed_versions',
      arguments: [
        this.sharedObject(
          tx,
          this.sharedObjects.BLIZZARD_AV({ mutable: false })
        ),
      ],
    });
  }

  public async newLST({
    tx = new Transaction(),
    treasuryCap,
    superAdminRecipient,
    adminWitness,
  }: NewLSTArgs) {
    this.assertObjectId(treasuryCap);

    invariant(
      isValidSuiAddress(superAdminRecipient),
      'Invalid super admin recipient'
    );

    this.assertNotZeroAddress(superAdminRecipient);

    const treasuryCapId =
      typeof treasuryCap === 'string' ? treasuryCap : treasuryCap.objectId;

    const treasuryCapObject = await this.client.getObject({
      id: treasuryCapId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    const treasuryCapTotalSupply = +pathOr(
      /// Force an error if we do not find the field
      '1',
      ['data', 'content', 'fields', 'total_supply', 'fields', 'value'],
      treasuryCapObject
    );

    invariant(
      treasuryCapTotalSupply === 0,
      'TreasuryCap Error: Total Supply is not 0 or not found'
    );

    const lstTypeArgument = treasuryCapObject.data?.type
      ?.split('<')[1]
      ?.slice(0, -1);

    invariant(lstTypeArgument, 'Invalid TreasuryCap: no memeCoinType found');

    const coinMetadata = await this.client.getCoinMetadata({
      coinType: normalizeStructTag(lstTypeArgument),
    });

    invariant(
      coinMetadata && coinMetadata.id,
      'Invalid Coin Metadata: no coin metadata ID found'
    );

    invariant(
      coinMetadata.decimals === 9,
      'Invalid Coin Metadata: decimals are not 9'
    );

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'new',
      arguments: [
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
        this.sharedObject(tx, coinMetadata.id),
        adminWitness,
        this.ownedObject(tx, treasuryCap),
        tx.pure.address(superAdminRecipient),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [lstTypeArgument],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async syncExchangeRate({
    tx = new Transaction(),
    blizzardStaking,
  }: SyncExchangeRateArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'sync_exchange_rate',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
      ],
      typeArguments: [lstType],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async mint({
    tx = new Transaction(),
    walCoin,
    nodeId,
    blizzardStaking,
  }: MintArgs) {
    this.assertObjectId(walCoin);

    this.assertObjectId(nodeId);
    this.assertObjectId(blizzardStaking);

    this.assertNotZeroAddress(nodeId);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.Protocol,
        function: 'mint',
        arguments: [
          this.sharedObject(tx, blizzardStaking),
          this.sharedObject(
            tx,
            this.sharedObjects.WALRUS_STAKING({ mutable: true })
          ),
          this.ownedObject(tx, walCoin),
          tx.pure.id(nodeId),
          this.getAllowedVersions(tx),
        ],
        typeArguments: [lstType],
      }),
    };
  }

  public async mintAfterVotesFinished({
    tx = new Transaction(),
    walCoin,
    nodeId,
    blizzardStaking,
  }: MintAfterVotesFinishedArgs) {
    this.assertObjectId(walCoin);

    this.assertObjectId(nodeId);
    this.assertObjectId(blizzardStaking);

    this.assertNotZeroAddress(nodeId);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.Protocol,
        function: 'mint_after_votes_finished',
        arguments: [
          this.sharedObject(tx, blizzardStaking),
          this.sharedObject(
            tx,
            this.sharedObjects.WALRUS_STAKING({ mutable: true })
          ),
          this.ownedObject(tx, walCoin),
          tx.pure.id(nodeId),
          this.getAllowedVersions(tx),
        ],
        typeArguments: [lstType],
      }),
    };
  }

  public keepStakeNft({ tx = new Transaction(), nft }: KeepStakeNftArgs) {
    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.StakeNFT,
      function: 'keep',
      arguments: [nft],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async burnStakeNft({
    tx = new Transaction(),
    nft,
    blizzardStaking,
  }: BurnStakeNftArgs) {
    this.assertObjectId(nft);

    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.Protocol,
        function: 'burn_stake_nft',
        arguments: [
          this.sharedObject(tx, blizzardStaking),
          this.sharedObject(
            tx,
            this.sharedObjects.WALRUS_STAKING({ mutable: false })
          ),
          this.ownedObject(tx, nft),
          this.getAllowedVersions(tx),
        ],
        typeArguments: [lstType],
      }),
    };
  }

  public async fcfs({
    tx = new Transaction(),
    blizzardStaking,
    value,
  }: FcfsArgs) {
    this.assertObjectId(blizzardStaking);

    invariant(BigInt(value.toString()) > 0n, 'Value must be greater than 0');

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD_HOOKS.latest,
        module: this.modules.Hooks,
        function: 'fcfs',
        arguments: [
          this.sharedObject(tx, blizzardStaking),
          this.sharedObject(
            tx,
            this.sharedObjects.WALRUS_STAKING({ mutable: true })
          ),
          tx.pure.u64(value),
        ],
        typeArguments: [lstType],
      }),
    };
  }

  public vectorTransferStakedWal({
    tx = new Transaction(),
    vector,
    to,
  }: VectorTransferStakedWalArgs) {
    this.assertNotZeroAddress(to);

    tx.moveCall({
      package: this.packages.BLIZZARD_UTILS.latest,
      module: this.modules.Utils,
      function: 'vector_transfer_staked_wal',
      arguments: [
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
        vector,
        tx.pure.address(to),
      ],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async burnLst({
    tx = new Transaction(),
    lstCoin,
    withdrawIXs,
    blizzardStaking,
  }: BurnLstArgs) {
    this.assertObjectId(lstCoin);

    this.assertObjectId(withdrawIXs);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.Protocol,
        function: 'burn_lst',
        arguments: [
          this.sharedObject(tx, blizzardStaking),
          this.sharedObject(
            tx,
            this.sharedObjects.WALRUS_STAKING({ mutable: true })
          ),
          this.ownedObject(tx, lstCoin),
          withdrawIXs,
          this.getAllowedVersions(tx),
        ],
        typeArguments: [lstType],
      }),
    };
  }

  public async addNode({
    tx = new Transaction(),
    nodeId,
    blizzardStaking,
    adminWitness,
  }: AddNodeArgs) {
    this.assertObjectId(blizzardStaking);

    this.assertNotZeroAddress(nodeId);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'add_node',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        adminWitness,
        tx.pure.id(nodeId),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [normalizeStructTag(lstType)],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async removeNode({
    tx = new Transaction(),
    nodeId,
    blizzardStaking,
    adminWitness,
  }: RemoveNodeArgs) {
    this.assertObjectId(blizzardStaking);

    this.assertNotZeroAddress(nodeId);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'remove_node',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        adminWitness,
        tx.pure.id(nodeId),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [normalizeStructTag(lstType)],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async getEpochData() {
    const data = await this.client.getObject({
      id: INNER_WALRUS_STAKING_ID,
      options: {
        showType: true,
        showContent: true,
      },
    });

    return getEpochData(data);
  }

  public async getFees(blizzardStaking: SharedObject) {
    const id =
      INNER_LST_STATE_ID[
        typeof blizzardStaking === 'string'
          ? blizzardStaking
          : blizzardStaking.objectId
      ];

    invariant(id, 'Blizzard inner state not found');

    const data = await this.client.getObject({
      id,
      options: {
        showType: true,
        showContent: true,
      },
    });

    return getFees(data);
  }

  public async getStakeNFTData(objectId: string) {
    const data = await this.client.getObject({
      id: objectId,
      options: {
        showContent: true,
      },
    });

    const stakeNFTData = getStakeNFTData(data);

    const epochData = await this.getEpochData();

    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.WALRUS.latest,
      module: this.modules.WalrusStaking,
      function: 'calculate_rewards',
      arguments: [
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
        tx.pure.id(stakeNFTData.nodeId),
        tx.pure.u64(stakeNFTData.principal),
        tx.pure.u32(stakeNFTData.activationEpoch),
        tx.pure.u32(epochData.currentEpoch),
      ],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.U64],
    ]);

    invariant(result[0], 'Invalid result: no rewards found');

    invariant(
      typeof result[0][0] === 'string',
      'Invalid result: no rewards found'
    );

    const rewards = BigInt(result[0][0]);

    return {
      ...stakeNFTData,
      rewards,
    };
  }

  /**
   * Calculate the APR for the last epoch
   * @param nodeId - The node ID to calculate the APR for the last epoch.
   * @returns The APR for the last epoch in percentage format. E.g.: 1 === 1%
   */
  public async lastEpochApr({ nodeId }: LastEpochAprArgs) {
    const tx = new Transaction();

    const epochData = await this.getEpochData();

    const principal = 1_000_000_000n;

    tx.moveCall({
      package: this.packages.WALRUS.latest,
      module: this.modules.WalrusStaking,
      function: 'calculate_rewards',
      arguments: [
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
        tx.pure.id(nodeId),
        tx.pure.u64(principal),
        tx.pure.u32(epochData.currentEpoch - 1),
        tx.pure.u32(epochData.currentEpoch),
      ],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.U64],
    ]);

    invariant(result[0], 'Invalid result: no rewards found');

    invariant(
      typeof result[0][0] === 'string',
      'Invalid result: no rewards found'
    );

    const rewards = new Decimal(result[0][0]);

    const epochDurationInDays = new Decimal(
      msToDays(epochData.epochDurationMs)
    );

    const apr = rewards
      .div(new Decimal(principal.toString()))
      .mul(new Decimal(365).div(epochDurationInDays))
      .mul(100);

    return apr.toNumber();
  }

  /**
   * Calculate the APR for the last epoch
   * @param nodeId - The node ID to calculate the APR for the last epoch.
   * @returns The APR for the last epoch in percentage format. E.g.: 1 === 1%
   */
  public async viewFcfs({ value, blizzardStaking }: ViewFcfsArgs) {
    const tx = new Transaction();
    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    tx.moveCall({
      package: this.packages.BLIZZARD_HOOKS.latest,
      module: this.modules.Hooks,
      function: 'fcfs',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: true })
        ),
        tx.pure.u64(value),
      ],
      typeArguments: [lstType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.U64, bcs.vector(IX)],
    ]);

    return result;
  }

  public async getLatestWalrusPackage() {
    const staking = await this.client.getObject({
      id: this.sharedObjects.WALRUS_STAKING({ mutable: false }).objectId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    const packageId = pathOr(
      '',
      ['data', 'content', 'fields', 'package_id'],
      staking
    );

    invariant(packageId, 'Invalid package ID');

    return normalizeSuiObjectId(packageId);
  }

  public async typeFromBlizzardStaking(blizzardStaking: SharedObject) {
    const blizzardStakingObject = await this.client.getObject({
      id:
        typeof blizzardStaking === 'string'
          ? blizzardStaking
          : blizzardStaking.objectId,
      options: {
        showType: true,
      },
    });

    const type = blizzardStakingObject.data?.type?.split('<')[1]?.slice(0, -1);

    invariant(type, 'Invalid Blizzard Staking: no type found');

    return normalizeStructTag(type);
  }

  public async toWalAtEpoch({
    epoch,
    value,
    blizzardStaking,
  }: ToWalAtEpochArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'sync_exchange_rate',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
      ],
      typeArguments: [lstType],
    });

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'to_wal_at_epoch',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        tx.pure.u32(epoch),
        tx.pure.u64(value),
        tx.pure.bool(false),
      ],
      typeArguments: [lstType],
    });

    const result = await this.client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: normalizeSuiAddress('0x0'),
    });

    invariant(
      result.results?.[1]?.returnValues?.[0]?.[0]?.length,
      'Invalid result: no return value found'
    );

    return OptionU64.parse(
      Uint8Array.from(result.results?.[1]?.returnValues[0][0])
    );
  }

  public async toLstAtEpoch({
    epoch,
    value,
    blizzardStaking,
  }: ToLstAtEpochArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    const tx = new Transaction();

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'sync_exchange_rate',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(
          tx,
          this.sharedObjects.WALRUS_STAKING({ mutable: false })
        ),
      ],
      typeArguments: [lstType],
    });

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'to_lst_at_epoch',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        tx.pure.u32(epoch),
        tx.pure.u64(value),
        tx.pure.bool(false),
      ],
      typeArguments: [lstType],
    });

    const result = await this.client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: normalizeSuiAddress('0x0'),
    });

    invariant(
      result.results?.[1]?.returnValues?.[0]?.[0]?.length,
      'Invalid result: no return value found'
    );

    return OptionU64.parse(
      Uint8Array.from(result.results?.[1]?.returnValues[0][0])
    );
  }

  public async allowedNodes(blizzardStaking: SharedObject) {
    const tx = new Transaction();

    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'allowed_nodes',
      typeArguments: [lstType],
      arguments: [this.sharedObject(tx, blizzardStaking)],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.vector(ID)],
    ]);

    invariant(result[0], 'Invalid result: no allowed nodes found');

    return result[0][0];
  }

  public async updateName({
    tx = new Transaction(),
    value,
    adminWitness,
    blizzardStaking,
  }: UpdateMetadataArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    const coinMetadata = await this.client.getCoinMetadata({
      coinType: normalizeStructTag(lstType),
    });

    invariant(
      coinMetadata?.id,
      'Invalid Coin Metadata: no coin metadata found'
    );

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'update_name',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(tx, coinMetadata.id),
        adminWitness,
        tx.pure.string(value),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [lstType],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async updateSymbol({
    tx = new Transaction(),
    value,
    adminWitness,
    blizzardStaking,
  }: UpdateMetadataArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    const coinMetadata = await this.client.getCoinMetadata({
      coinType: normalizeStructTag(lstType),
    });

    invariant(
      coinMetadata?.id,
      'Invalid Coin Metadata: no coin metadata found'
    );

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'update_symbol',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(tx, coinMetadata.id),
        adminWitness,
        tx.pure.string(value),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [lstType],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async updateDescription({
    tx = new Transaction(),
    value,
    adminWitness,
    blizzardStaking,
  }: UpdateMetadataArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    const coinMetadata = await this.client.getCoinMetadata({
      coinType: normalizeStructTag(lstType),
    });

    invariant(
      coinMetadata?.id,
      'Invalid Coin Metadata: no coin metadata found'
    );

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'update_description',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(tx, coinMetadata.id),
        adminWitness,
        tx.pure.string(value),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [lstType],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async updateIconUrl({
    tx = new Transaction(),
    value,
    adminWitness,
    blizzardStaking,
  }: UpdateMetadataArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    const coinMetadata = await this.client.getCoinMetadata({
      coinType: normalizeStructTag(lstType),
    });

    invariant(
      coinMetadata?.id,
      'Invalid Coin Metadata: no coin metadata found'
    );

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.Protocol,
      function: 'update_icon_url',
      arguments: [
        this.sharedObject(tx, blizzardStaking),
        this.sharedObject(tx, coinMetadata.id),
        adminWitness,
        tx.pure.string(value),
        this.getAllowedVersions(tx),
      ],
      typeArguments: [lstType],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async getBlizzardStaking(
    blizzardStaking: SharedObject
  ): Promise<BlizzardStaking> {
    const id =
      typeof blizzardStaking === 'string'
        ? blizzardStaking
        : blizzardStaking.objectId;

    const innerLstStateId = INNER_LST_STATE_ID[id];

    invariant(innerLstStateId, 'Invalid blizzard staking');

    const innerTreasuryCapId = INNER_LST_TREASURY_CAP[id];

    invariant(innerTreasuryCapId, 'Invalid blizzard staking');

    const [data, treasuryCap, type] = await Promise.all([
      this.client.getObject({
        id: innerLstStateId,
        options: {
          showType: true,
          showContent: true,
        },
      }),
      this.client.getObject({
        id: innerTreasuryCapId,
        options: {
          showType: true,
          showContent: true,
        },
      }),
      this.typeFromBlizzardStaking(blizzardStaking),
    ]);

    return {
      ...(await formatBlizzardStaking(data)),
      objectId: id,
      type,
      lstSupply: BigInt(
        pathOr(
          0n,
          ['data', 'content', 'fields', 'total_supply', 'fields', 'value'],
          treasuryCap
        )
      ),
    };
  }

  public async claimFees({
    tx = new Transaction(),
    adminWitness,
    blizzardStaking,
  }: ClaimFeesArgs) {
    this.assertObjectId(blizzardStaking);

    const lstType = await this.maybeFetchAndCacheLstType(blizzardStaking);

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.Protocol,
        function: 'claim_fees',
        typeArguments: [lstType],
        arguments: [
          this.sharedObject(tx, blizzardStaking),
          adminWitness,
          this.getAllowedVersions(tx),
        ],
      }),
    };
  }

  public async transmute({
    tx = new Transaction(),
    withdrawIXs,
    fromBlizzardStaking,
    fromCoin,
  }: TransmuteArgs) {
    const fromBlizzardStakingId =
      typeof fromBlizzardStaking === 'string'
        ? fromBlizzardStaking
        : fromBlizzardStaking.objectId;

    this.assertObjectId(fromBlizzardStaking);

    this.assertObjectId(fromCoin);

    const lstType = await this.maybeFetchAndCacheLstType(fromBlizzardStaking);

    const wWalStaking = SHARED_OBJECTS.WWAL_STAKING({ mutable: true });

    invariant(
      normalizeSuiObjectId(fromBlizzardStakingId) !==
        normalizeSuiObjectId(wWalStaking.objectId),
      'Cannot transmute from wWAL'
    );

    return {
      tx,
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.Protocol,
        function: 'transmute',
        arguments: [
          this.sharedObject(tx, fromBlizzardStaking),
          this.sharedObject(tx, wWalStaking),
          this.sharedObject(
            tx,
            SHARED_OBJECTS.WALRUS_STAKING({ mutable: true })
          ),
          this.ownedObject(tx, fromCoin),
          withdrawIXs,
          this.getAllowedVersions(tx),
        ],
        typeArguments: [lstType],
      }),
    };
  }

  async maybeFetchAndCacheLstType(blizzardStaking: SharedObject) {
    const id =
      typeof blizzardStaking === 'string'
        ? blizzardStaking
        : blizzardStaking.objectId;

    if (lstTypeCache.has(id)) {
      return Promise.resolve(lstTypeCache.get(id)!);
    }

    const type = await this.typeFromBlizzardStaking(blizzardStaking);

    lstTypeCache.set(id, type);

    return type;
  }
}
