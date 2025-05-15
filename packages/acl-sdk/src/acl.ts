import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { isValidSuiAddress } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import {
  DestroyAdminArgs,
  DestroySuperAdminArgs,
  FinishSuperAdminTransferArgs,
  IsAdminArgs,
  NewAdminAndTransferArgs,
  NewAdminArgs,
  RevokeAdminArgs,
  SdkConstructorArgs,
  StartSuperAdminTransferArgs,
} from './acl.types';
import { SDK } from './sdk';

export class AclSDK extends SDK {
  constructor(args: SdkConstructorArgs) {
    super(args);
  }

  public newAdmin({ tx = new Transaction(), superAdmin }: NewAdminArgs) {
    const admin = tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'new_admin',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: true,
        }),
        this.ownedObject(tx, superAdmin),
      ],
      typeArguments: [this.otw],
    });

    return {
      admin,
      tx,
    };
  }

  public newAdminAndTransfer({
    tx = new Transaction(),
    superAdmin,
    recipient,
  }: NewAdminAndTransferArgs) {
    invariant(
      isValidSuiAddress(recipient),
      'recipient must be a valid Sui address'
    );

    const admin = tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'new_admin',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: true,
        }),
        this.ownedObject(tx, superAdmin),
      ],
      typeArguments: [this.otw],
    });

    tx.transferObjects([admin], recipient);

    return tx;
  }

  public revokeAdmin({
    tx = new Transaction(),
    superAdmin,
    admin,
  }: RevokeAdminArgs) {
    tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'revoke',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: true,
        }),
        this.ownedObject(tx, superAdmin),
        tx.pure.address(admin),
      ],
      typeArguments: [this.otw],
    });

    return tx;
  }

  public destroyAdmin({ tx = new Transaction(), admin }: DestroyAdminArgs) {
    tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'destroy_admin',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: true,
        }),
        this.ownedObject(tx, admin),
      ],
      typeArguments: [this.otw],
    });

    return tx;
  }

  public destroySuperAdmin({
    tx = new Transaction(),
    superAdmin,
  }: DestroySuperAdminArgs) {
    tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'destroy_super_admin',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: true,
        }),
        this.ownedObject(tx, superAdmin),
      ],
      typeArguments: [this.otw],
    });

    return tx;
  }

  public startSuperAdminTransfer({
    tx = new Transaction(),
    superAdmin,
    recipient,
  }: StartSuperAdminTransferArgs) {
    tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'start_transfer',
      arguments: [this.ownedObject(tx, superAdmin), tx.pure.address(recipient)],
      typeArguments: [this.otw],
    });

    return tx;
  }

  public finishSuperAdminTransfer({
    tx = new Transaction(),
    superAdmin,
  }: FinishSuperAdminTransferArgs) {
    tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'finish_transfer',
      arguments: [this.ownedObject(tx, superAdmin)],
      typeArguments: [this.otw],
    });

    return tx;
  }

  public async isAdmin({ admin }: IsAdminArgs) {
    const tx = new Transaction();

    tx.moveCall({
      package: this.package,
      module: 'access_control',
      function: 'is_admin',
      arguments: [
        tx.sharedObjectRef({
          objectId: this.aclObjectId,
          initialSharedVersion: this.aclInitialSharedVersion,
          mutable: false,
        }),
        tx.pure.address(admin),
      ],
      typeArguments: [this.otw],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.Bool],
    ]);

    invariant(
      result[0],
      'isAdmin devInspectAndGetReturnValues result is undefined'
    );

    return result[0][0];
  }
}
