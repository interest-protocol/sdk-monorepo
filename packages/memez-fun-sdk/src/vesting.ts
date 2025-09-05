import { Transaction } from '@mysten/sui/transactions';

import { MemezBaseSDK } from './sdk';
import { SdkConstructorArgs } from './types/memez.types';
import {
  NewArgs,
  Vesting,
  ClaimArgs,
  DestroyZeroBalanceArgs,
  UncheckedDestroyZeroBalanceArgs,
} from './types/vesting.types';
import { normalizeSuiObjectId } from '@mysten/sui/utils';
import { parseVesting } from './utils';
import invariant from 'tiny-invariant';

export class MemezVestingSDK extends MemezBaseSDK {
  #module = 'memez_soulbound_vesting';

  /**
   * Initiates the MemezPump SDK.
   *
   * @param args - An object containing the necessary arguments to initialize the SDK.
   * @param args.fullNodeUrl - The full node URL to use for the SDK.
   * @param args.packages - The package addresses to use for the SDK.
   * @param args.sharedObjects - A record of shared objects to use for the SDK.
   * @param args.network - The network to use for the SDK. Either `mainnet` or `testnet`.
   */
  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }

  new({
    coin,
    start,
    duration,
    owner,
    coinType,
    tx = new Transaction(),
  }: NewArgs) {
    const vesting = tx.moveCall({
      package: this.packages.VESTING.latest,
      module: this.#module,
      function: 'new',
      arguments: [
        tx.object.clock(),
        this.ownedObject(tx, coin),
        tx.pure.u64(start),
        tx.pure.u64(duration),
        tx.pure.address(owner),
      ],
      typeArguments: [coinType],
    });

    tx.moveCall({
      package: this.packages.VESTING.latest,
      module: this.#module,
      function: 'transfer_to_owner',
      arguments: [vesting],
      typeArguments: [coinType],
    });

    return { tx };
  }

  async claim({ tx = new Transaction(), vesting }: ClaimArgs) {
    const vestingObject =
      typeof vesting === 'string' ? await this.get(vesting) : vesting;

    const coin = tx.moveCall({
      package: this.packages.VESTING.latest,
      module: this.#module,
      function: 'claim',
      arguments: [tx.object(vestingObject.objectId), tx.object.clock()],
      typeArguments: [vestingObject.coinType],
    });

    return { tx, coin };
  }

  async destroyZeroBalance({
    tx = new Transaction(),
    vesting,
  }: DestroyZeroBalanceArgs) {
    const vestingObject =
      typeof vesting === 'string' ? await this.get(vesting) : vesting;

    invariant(vestingObject.balance === 0n, 'Vesting balance is not zero');

    tx.moveCall({
      package: this.packages.VESTING.latest,
      module: this.#module,
      function: 'destroy_zero',
      arguments: [tx.object(vestingObject.objectId)],
      typeArguments: [vestingObject.coinType],
    });

    return { tx };
  }

  async uncheckedDestroyZeroBalance({
    tx = new Transaction(),
    vestingObjectId,
    coinType,
  }: UncheckedDestroyZeroBalanceArgs) {
    tx.moveCall({
      package: this.packages.VESTING.latest,
      module: this.#module,
      function: 'destroy_zero',
      arguments: [tx.object(vestingObjectId)],
      typeArguments: [coinType],
    });

    return { tx };
  }

  async get(vesting: string) {
    const suiObject = await this.client.getObject({
      id: normalizeSuiObjectId(vesting),
      options: { showContent: true, showType: true },
    });

    return parseVesting(suiObject);
  }

  async getMultiple(vestings: string[]) {
    const suiObjects = await this.client.multiGetObjects({
      ids: vestings.map((x) => normalizeSuiObjectId(x)),
      options: { showContent: true, showType: true },
    });

    return suiObjects.map((x) => parseVesting(x));
  }

  async calculateClaimable(vesting: Vesting | string) {
    const vestingObject =
      typeof vesting === 'string' ? await this.get(vesting) : vesting;

    const now = BigInt(Math.floor(Date.now()));

    if (now < vestingObject.start) return 0n;

    const total = vestingObject.balance + vestingObject.released;

    if (now > vestingObject.start + vestingObject.duration) return total;

    return (total * (now - vestingObject.start)) / vestingObject.duration;
  }
}
