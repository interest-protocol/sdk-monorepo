import { SharedObject } from '@interest-protocol/sui-core-sdk';
import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';

import { SDK } from './sdk';
import {
  DestroyAdminArgs,
  DestroySuperAdminArgs,
  FinishSuperAdminTransferArgs,
  InterestStableSwapAclArgs,
  NewAdminArgs,
  RevokeAdminArgs,
  SignInArgs,
  StartSuperAdminTransferArgs,
} from './stable-swap.types';

export class InterestStableSwapAclSDK extends SDK {
  acl: SharedObject;
  lstType: string | undefined;

  constructor(args: InterestStableSwapAclArgs) {
    invariant(args, 'You must provide an ACL object');

    const { acl, ...rest } = args;

    super(rest);

    invariant(acl, 'You must provide an ACL object');

    this.acl = acl;
  }

  public async newAdmin({ tx = new Transaction(), superAdmin }: NewAdminArgs) {
    this.assertObjectId(superAdmin);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: this.modules.Acl,
        function: 'new_admin',
        arguments: [
          this.sharedObject(tx, this.acl),
          this.ownedObject(tx, superAdmin),
        ],
      }),
      tx,
    };
  }

  public async signIn({ tx = new Transaction(), admin }: SignInArgs) {
    this.assertObjectId(admin);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: this.modules.Acl,
        function: 'sign_in',
        arguments: [
          this.sharedObject(tx, this.acl),
          this.ownedObject(tx, admin),
        ],
      }),
      tx,
    };
  }

  public async revokeAdmin({
    tx = new Transaction(),
    superAdmin,
    admin,
  }: RevokeAdminArgs) {
    this.assertObjectId(superAdmin);
    this.assertNotZeroAddress(admin);

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: this.modules.Acl,
      function: 'revoke',
      arguments: [
        this.sharedObject(tx, this.acl),
        this.ownedObject(tx, superAdmin),
        tx.pure.address(admin),
      ],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async destroyAdmin({
    tx = new Transaction(),
    admin,
  }: DestroyAdminArgs) {
    this.assertObjectId(admin);

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: this.modules.Acl,
      function: 'destroy_admin',
      arguments: [this.sharedObject(tx, this.acl), this.ownedObject(tx, admin)],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async startSuperAdminTransfer({
    tx = new Transaction(),
    superAdmin,
    recipient,
  }: StartSuperAdminTransferArgs) {
    this.assertObjectId(superAdmin);
    this.assertNotZeroAddress(recipient);

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: this.modules.Acl,
      function: 'start_transfer',
      arguments: [this.ownedObject(tx, superAdmin), tx.pure.address(recipient)],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async finishSuperAdminTransfer({
    tx = new Transaction(),
    superAdmin,
  }: FinishSuperAdminTransferArgs) {
    this.assertObjectId(superAdmin);

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: this.modules.Acl,
      function: 'finish_transfer',
      arguments: [this.ownedObject(tx, superAdmin)],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async destroySuperAdmin({
    tx = new Transaction(),
    superAdmin,
  }: DestroySuperAdminArgs) {
    this.assertObjectId(superAdmin);

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: this.modules.Acl,
      function: 'destroy',
      arguments: [this.ownedObject(tx, superAdmin)],
    });

    return {
      tx,
      returnValues: null,
    };
  }
}
