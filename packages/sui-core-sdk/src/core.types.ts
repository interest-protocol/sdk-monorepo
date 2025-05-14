import {
  ObjectRef,
  Transaction,
  TransactionObjectArgument,
} from '@mysten/sui/transactions';

export type ObjectInput = TransactionObjectArgument | string | ObjectRef;

export type U64 = string | bigint | number;

export type OwnedObject = TransactionObjectArgument | string | ObjectRef;

export type SharedObject = string | SharedObjectRef;

export interface SharedObjectRef {
  objectId: string;
  mutable: boolean;
  initialSharedVersion: number | string;
}

export interface MaybeTx {
  tx?: Transaction;
}

export interface PackageValues {
  original: string;
  latest: string;
}
