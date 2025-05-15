import { SuiCoreSDK } from '@interest-protocol/sui-core-sdk';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';

import { Package, SdkConstructorArgs, SharedObjects } from './blizzard.types';
import { Modules, TYPES } from './constants';
import { getSdkDefaultArgs } from './utils';

export class BlizzardCoreSDK extends SuiCoreSDK {
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
}
