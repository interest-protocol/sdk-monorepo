import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import { SHARED_OBJECTS } from './constants';
import { MemezBaseSDK } from './sdk';
import { SdkConstructorArgs } from './types/memez.types';
import {
  WalletMergeCoinsArgs,
  WalletNewArgs,
  WalletReceiveArgs,
  WalletReceiveCoinsArgs,
} from './types/wallet.types';

export class MemezWalletSDK extends MemezBaseSDK {
  private walletRegistryIdOverride?: string;

  /**
   * Initiates the MemezPump SDK.
   *
   * @param args - An object containing the necessary arguments to initialize the SDK.
   * @param args.fullNodeUrl - The full node URL to use for the SDK.
   * @param args.packages - The package addresses to use for the SDK.
   * @param args.sharedObjects - A record of shared objects to use for the SDK.
   * @param args.network - The network to use for the SDK. Either `mainnet` or `testnet`.
   * @param args.walletRegistryId - Optional wallet registry object ID to override the default.
   */
  constructor(
    args: (SdkConstructorArgs & { walletRegistryId?: string }) | undefined | null = null
  ) {
    super(args);
    this.walletRegistryIdOverride = args?.walletRegistryId;
  }

  private getWalletRegistryInput(tx: Transaction, mutable: boolean) {
    if (this.walletRegistryIdOverride) {
      return tx.object(this.walletRegistryIdOverride);
    }
    return tx.sharedObjectRef(
      SHARED_OBJECTS.mainnet.WALLET_REGISTRY({ mutable })
    );
  }

  async newWallet({ owner, tx = new Transaction() }: WalletNewArgs) {
    invariant(
      (await this.getWalletAddress(owner)) == null,
      'Wallet already exists'
    );

    const wallet = tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::new`,
      arguments: [
        this.getWalletRegistryInput(tx, true),
        tx.pure.address(owner),
      ],
    });

    tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::share`,
      arguments: [wallet],
    });

    return { tx };
  }

  receive({
    type,
    objectId,
    wallet,
    tx = new Transaction(),
  }: WalletReceiveArgs) {
    const object = tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::receive`,
      arguments: [tx.object(wallet), tx.object(objectId)],
      typeArguments: [normalizeStructTag(type)],
    });

    return { tx, object };
  }

  mergeCoins({
    coinType,
    coins,
    wallet,
    tx = new Transaction(),
  }: WalletMergeCoinsArgs) {
    tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::merge_coins`,
      arguments: [
        tx.object(wallet),
        tx.makeMoveVec({
          elements: coins.map((coin) =>
            tx.receivingRef({
              objectId: coin.objectId,
              version: coin.version,
              digest: coin.digest,
            })
          ),
          type: `0x2::transfer::Receiving<0x2::coin::Coin<${coinType}>>`,
        }),
      ],
      typeArguments: [normalizeStructTag(coinType)],
    });

    return { tx };
  }

  receiveCoins({
    coinType,
    coins,
    wallet,
    tx = new Transaction(),
  }: WalletReceiveCoinsArgs) {
    const coin = tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::receive_coins`,
      arguments: [
        tx.object(wallet),
        tx.makeMoveVec({
          elements: coins.map((coin) =>
            tx.receivingRef({
              objectId: coin.objectId,
              version: coin.version,
              digest: coin.digest,
            })
          ),
          type: `0x2::transfer::Receiving<0x2::coin::Coin<${coinType}>>`,
        }),
      ],
      typeArguments: [normalizeStructTag(coinType)],
    });

    return { tx, coin };
  }

  async getWalletAddress(owner: string): Promise<string | null> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::wallet_address`,
      arguments: [
        this.getWalletRegistryInput(tx, false),
        tx.pure.address(owner),
      ],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.option(bcs.Address)],
    ]);

    return result[0][0] as null | string;
  }
}
