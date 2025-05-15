import { SharedObject } from '@interest-protocol/sui-core-sdk';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import {
  BlizzardAclArgs,
  DestroyAdminArgs,
  DestroySuperAdminArgs,
  FinishSuperAdminTransferArgs,
  IsAdminArgs,
  NewAdminAndTransferArgs,
  NewAdminArgs,
  RevokeAdminArgs,
  SignInArgs,
  StartSuperAdminTransferArgs,
} from './blizzard.types';
import { BlizzardCoreSDK } from './sdk';

export class BlizzardAclSDK extends BlizzardCoreSDK {
  acl: SharedObject;
  lstType: string | undefined;

  constructor(args: BlizzardAclArgs) {
    const { acl, ...rest } = args;
    super(rest);
    invariant(args, 'You must provide an ACL object');

    invariant(acl, 'You must provide an ACL object');

    this.acl = acl;
  }

  public async newAdmin({
    tx = new Transaction(),
    superAdmin,
    lstType = this.lstType,
  }: NewAdminArgs) {
    this.assertObjectId(superAdmin);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    return {
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.ACL,
        function: 'new_admin',
        typeArguments: [lstType],
        arguments: [
          this.sharedObject(tx, this.acl),
          this.ownedObject(tx, superAdmin),
        ],
      }),
      tx,
    };
  }

  public async newAdminAndTransfer({
    tx = new Transaction(),
    superAdmin,
    recipient,
    lstType = this.lstType,
  }: NewAdminAndTransferArgs) {
    this.assertObjectId(superAdmin);
    this.assertNotZeroAddress(recipient);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'new_and_transfer',
      typeArguments: [lstType],
      arguments: [
        this.sharedObject(tx, this.acl),
        this.ownedObject(tx, superAdmin),
        tx.pure.address(recipient),
      ],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async signIn({
    tx = new Transaction(),
    admin,
    lstType = this.lstType,
  }: SignInArgs) {
    this.assertObjectId(admin);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    return {
      returnValues: tx.moveCall({
        package: this.packages.BLIZZARD.latest,
        module: this.modules.ACL,
        function: 'sign_in',
        typeArguments: [lstType],
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
    lstType = this.lstType,
  }: RevokeAdminArgs) {
    this.assertObjectId(superAdmin);
    this.assertNotZeroAddress(admin);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'revoke',
      typeArguments: [lstType],
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

  public async isAdmin({ admin, lstType = this.lstType }: IsAdminArgs) {
    const tx = new Transaction();

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'is_admin',
      typeArguments: [lstType],
      arguments: [this.sharedObject(tx, this.acl), tx.pure.address(admin)],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.Bool],
    ]);

    invariant(result[0], 'Invalid result: no admin found');

    return result[0][0];
  }

  public async destroyAdmin({
    tx = new Transaction(),
    admin,
    lstType = this.lstType,
  }: DestroyAdminArgs) {
    this.assertObjectId(admin);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'destroy_admin',
      typeArguments: [lstType],
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
    lstType = this.lstType,
  }: StartSuperAdminTransferArgs) {
    this.assertObjectId(superAdmin);
    this.assertNotZeroAddress(recipient);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'start_transfer',
      typeArguments: [lstType],
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
    lstType = this.lstType,
  }: FinishSuperAdminTransferArgs) {
    this.assertObjectId(superAdmin);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'finish_transfer',
      typeArguments: [lstType],
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
    lstType = this.lstType,
  }: DestroySuperAdminArgs) {
    this.assertObjectId(superAdmin);

    lstType = await this.maybeFetchAndSaveLstType(lstType);

    tx.moveCall({
      package: this.packages.BLIZZARD.latest,
      module: this.modules.ACL,
      function: 'destroy',
      typeArguments: [lstType],
      arguments: [this.ownedObject(tx, superAdmin)],
    });

    return {
      tx,
      returnValues: null,
    };
  }

  public async typeFromBlizzardAcl(blizzardAcl: SharedObject) {
    const blizzardAclObject = await this.client.getObject({
      id: typeof blizzardAcl === 'string' ? blizzardAcl : blizzardAcl.objectId,
      options: {
        showType: true,
      },
    });

    const type = blizzardAclObject.data?.type?.split('<')[1]?.slice(0, -1);

    invariant(type, 'Invalid Blizzard ACL: no type found');

    return type;
  }

  async maybeFetchAndSaveLstType(lstType?: string) {
    if (lstType) {
      return Promise.resolve(normalizeStructTag(lstType));
    }

    this.lstType = normalizeStructTag(await this.typeFromBlizzardAcl(this.acl));
    return this.lstType;
  }
}
