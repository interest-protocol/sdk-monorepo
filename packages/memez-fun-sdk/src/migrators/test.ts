import { Transaction } from '@mysten/sui/transactions';

import { MemezBaseSDK } from '../sdk';
import {
  SdkConstructorArgs,
  TestMigratorMigrateArgs,
} from '../types/memez.types';

export class TestMigratorSDK extends MemezBaseSDK {
  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }

  public migrate({
    tx = new Transaction(),
    migrator,
    memeCoinType,
    quoteCoinType,
  }: TestMigratorMigrateArgs) {
    tx.moveCall({
      package: this.packages.TEST_MEMEZ_MIGRATOR.latest,
      module: 'dummy',
      function: 'migrate',
      arguments: [migrator],
      typeArguments: [memeCoinType, quoteCoinType],
    });

    return {
      tx,
    };
  }
}
