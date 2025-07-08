import { MaybeTx, ObjectInput } from '@interest-protocol/sui-core-sdk';

export interface SignInArgs extends MaybeTx {
  admin: ObjectInput;
}

export interface SdkConstructorArgs {
  fullNodeUrl: string;
  otw: string;
  aclObjectId: string;
  aclInitialSharedVersion: string;
  package: string;
}

export interface NewAdminArgs extends MaybeTx {
  superAdmin: ObjectInput;
}

export interface NewAdminAndTransferArgs extends MaybeTx {
  superAdmin: ObjectInput;
  recipient: string;
}

export interface RevokeAdminArgs extends MaybeTx {
  superAdmin: ObjectInput;
  admin: string;
}

export interface DestroyAdminArgs extends MaybeTx {
  admin: ObjectInput;
}

export interface DestroySuperAdminArgs extends MaybeTx {
  superAdmin: ObjectInput;
}

export interface StartSuperAdminTransferArgs extends MaybeTx {
  superAdmin: ObjectInput;
  recipient: string;
}

export interface FinishSuperAdminTransferArgs extends MaybeTx {
  superAdmin: ObjectInput;
}

export interface IsAdminArgs {
  admin: string;
}

export interface AddRoleArgs extends MaybeTx {
  superAdmin: ObjectInput;
  admin: string;
  role: number;
}

export interface RemoveRoleArgs extends MaybeTx {
  superAdmin: ObjectInput;
  admin: string;
  role: number;
}
