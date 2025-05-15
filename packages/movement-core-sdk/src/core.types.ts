import { AccountAddress } from '@aptos-labs/ts-sdk';

export interface Package {
  name: string;
  address: AccountAddress;
}

export interface MoveResourceType {
  account_address: string;
  module_name: string;
  struct_name: string;
}
