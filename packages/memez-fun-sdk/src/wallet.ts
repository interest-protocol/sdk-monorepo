import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';

import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';
import { MemezBaseSDK } from './sdk';
import { SdkConstructorArgs } from './types/memez.types';
import { SHARED_OBJECTS } from './constants';
import {
  WalletReceiveArgs,
  WalletReceiveCoinsArgs,
  WalletMergeCoinsArgs,
} from './types/wallet.types';
import { normalizeStructTag } from '@mysten/sui/utils';

export class MemezWalletSDK extends MemezBaseSDK {
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

  async newWallet(owner: string) {
    invariant(
      (await this.getWalletAddress(owner)) == null,
      'Wallet already exists'
    );

    const tx = new Transaction();

    const wallet = tx.moveCall({
      target: `${this.packages.WALLET.latest}::memez_wallet::new`,
      arguments: [
        tx.sharedObjectRef(
          SHARED_OBJECTS.mainnet.WALLET_REGISTRY({ mutable: true })
        ),
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
        tx.sharedObjectRef(
          SHARED_OBJECTS.mainnet.WALLET_REGISTRY({ mutable: false })
        ),
        tx.pure.address(owner),
      ],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.option(bcs.Address)],
    ]);

    return result[0][0] as null | string;
  }
}
