import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';

import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';
import { MemezBaseSDK } from './sdk';
import { SdkConstructorArgs } from './types/memez.types';
import { SHARED_OBJECTS } from './constants';

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
