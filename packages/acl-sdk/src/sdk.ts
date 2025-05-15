import { SuiCoreSDK } from '@interest-protocol/sui-core-sdk';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { SdkConstructorArgs, SignInArgs } from './acl.types';

export class SDK extends SuiCoreSDK {
  #rpcUrl: string;
  otw: string;
  aclObjectId: string;
  aclInitialSharedVersion: string;
  package: string;
  client: SuiClient;

  constructor(data: SdkConstructorArgs) {
    super();
    this.#rpcUrl = data.fullNodeUrl;

    this.client = new SuiClient({ url: data.fullNodeUrl });
    this.otw = data.otw;
    this.aclObjectId = data.aclObjectId;
    this.aclInitialSharedVersion = data.aclInitialSharedVersion;
    this.package = data.package;
  }

  public rpcUrl() {
    return this.#rpcUrl;
  }

  signIn({ tx = new Transaction(), admin }: SignInArgs) {
    const authWitness = tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'sign_in',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: false,
        }),
        this.ownedObject(tx, admin),
      ],
      typeArguments: [this.otw],
    });

    return {
      tx,
      authWitness,
    };
  }
}
