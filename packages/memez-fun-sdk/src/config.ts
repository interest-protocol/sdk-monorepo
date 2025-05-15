import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';

import { MemezBaseSDK } from './sdk';
import {
  AddMigrationWitnessArgs,
  AddQuoteCoinArgs,
  RemoveConfigurationArgs,
  RemoveMigrationWitnessArgs,
  RemoveQuoteCoinArgs,
  SdkConstructorArgs,
  SetFeesArgs,
} from './types/memez.types';

export class ConfigSDK extends MemezBaseSDK {
  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }

  public addMigrationWitness({
    tx = new Transaction(),
    authWitness,
    configKey,
    migratorWitness,
  }: AddMigrationWitnessArgs) {
    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'add_migrator_witness',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: true })),
        this.ownedObject(tx, authWitness),
      ],
      typeArguments: [
        normalizeStructTag(configKey),
        normalizeStructTag(migratorWitness),
      ],
    });

    return tx;
  }

  public removeMigrationWitness({
    tx = new Transaction(),
    authWitness,
    configKey,
    migratorWitness,
  }: RemoveMigrationWitnessArgs) {
    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'remove_migrator_witness',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: true })),
        this.ownedObject(tx, authWitness),
      ],
      typeArguments: [
        normalizeStructTag(configKey),
        normalizeStructTag(migratorWitness),
      ],
    });

    return tx;
  }

  public setFees({
    tx = new Transaction(),
    authWitness,
    configurationKey,
    values,
    recipients,
  }: SetFeesArgs) {
    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'set_fees',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: true })),
        this.ownedObject(tx, authWitness),
        tx.pure(bcs.vector(bcs.vector(bcs.u64())).serialize(values).toBytes()),
        tx.pure(
          bcs.vector(bcs.vector(bcs.Address)).serialize(recipients).toBytes()
        ),
      ],
      typeArguments: [normalizeStructTag(configurationKey)],
    });

    return tx;
  }

  public addQuoteCoin({
    tx = new Transaction(),
    authWitness,
    configKey,
    quoteCoinType,
  }: AddQuoteCoinArgs) {
    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'add_quote_coin',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: true })),
        this.ownedObject(tx, authWitness),
      ],
      typeArguments: [
        normalizeStructTag(configKey),
        normalizeStructTag(quoteCoinType),
      ],
    });

    return tx;
  }

  public removeQuoteCoin({
    tx = new Transaction(),
    authWitness,
    configKey,
    quoteCoinType,
  }: RemoveQuoteCoinArgs) {
    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'remove_quote_coin',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: true })),
        this.ownedObject(tx, authWitness),
      ],
      typeArguments: [
        normalizeStructTag(configKey),
        normalizeStructTag(quoteCoinType),
      ],
    });

    return tx;
  }

  public removeConfiguration({
    tx = new Transaction(),
    key,
    model,
    authWitness,
  }: RemoveConfigurationArgs) {
    tx.moveCall({
      package: this.packages.MEMEZ_FUN.latest,
      module: this.modules.CONFIG,
      function: 'remove',
      arguments: [
        tx.sharedObjectRef(this.sharedObjects.CONFIG({ mutable: true })),
        this.ownedObject(tx, authWitness),
      ],
      typeArguments: [normalizeStructTag(key), normalizeStructTag(model)],
    });

    return tx;
  }
}
